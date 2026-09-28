---
slug: closure-ref-prevent-stale-updates
date: 2026-09-10
tag: ['前端', 'Hook', '代码设计']
column: 教程
detail: '在 SSE、AI 流式输出等场景中，用户连续触发两次生成后，旧请求的回调仍可能交错更新状态：文本来回闪烁、成功被旧错误覆盖。本文以 useFunctionPointStream Hook 为例，说明为什么 abort() 不能替代业务层校验，如何用「闭包保存本次执行版本 + Ref 保存当前有效版本」的 runId 校验模式，在 onChunk、await 之后、catch、finally 等所有副作用位置阻止过期回调提交状态，并给出可直接复用的 useLatestAsyncTask 最小模板与常见踩坑清单。'
---

# 闭包与 Ref：阻止旧请求更新状态

在 SSE、Fetch Stream、AI 流式输出等场景中，一个请求通常会多次触发数据回调。用户连续点击“重新生成”后，前后两次请求的回调可能交错执行：页面文本反复切换，或者新请求的成功状态被旧请求随后产生的错误状态覆盖。

常见处理方式是在新请求开始前对旧请求执行 `abort()`。该操作可以通知旧请求停止，但不能替代业务层的状态更新校验。

本文以项目中的 `useFunctionPointStream` Hook 为例，说明如何使用闭包保存本次执行版本，并使用 Ref 保存当前有效版本，从业务层阻止过期回调更新状态。

## 1. 典型问题：前后两次请求交错更新状态

假设用户先后触发两次生成：

```text
时间 ──────────────────────────────────────────────>

请求 A：启动 ── chunk A1 ──────── catch / finally
                       \
请求 B：           启动 ── chunk B1 ── chunk B2 ── 完成
                   ↑
               abort 请求 A
```

预期行为是：B 开始执行后，A 的后续结果不再影响页面。

如果缺少有效性校验，可能出现以下问题：

- A、B 的文本分块交替写入，页面内容来回闪烁；
- B 已经成功，A 随后进入 `catch`，把页面改成失败；
- A 的 `finally` 在 B 开始后执行，清理了 B 正在使用的控制器；
- 旧数据被拼进新数据，最终 JSON 解析失败。

除确认请求是否收到取消信号外，还需要在每次修改 State 前确认当前回调属于有效的执行版本。

## 2. 为什么调用 `abort()` 仍然不够

### 2.1 异步回调的执行时机与函数调用不同步

`functionPointStream()` 返回或下一次调用开始，并不意味着上一次调用创建的异步逻辑已经停止。`await` 后的代码会进入微任务队列；已经入队的回调，以及未检查 `AbortSignal` 的业务逻辑，仍可能继续执行。

流式请求会多次调用 `onChunk`，Promise 最终还会执行后续成功逻辑、`catch` 或 `finally`。这些位置都可能更新状态或清理共享资源。

### 2.2 `AbortController` 负责取消通知，不负责状态版本校验

`AbortController` 通过 `AbortSignal` 通知请求、流读取或其他支持该信号的异步 API 停止操作。操作能否及时停止，取决于调用链是否正确传递并检查 signal。它不能撤回已经执行的 JavaScript，也不会自动取消未响应 signal 的业务回调，更无法判断某次 `updateStep()` 是否属于过期请求。

而且，“取消”本身也可能让 Promise 进入 `catch`。如果 `catch` 不区分执行批次，旧请求仍可能把当前界面写成错误状态。

因此，`abort()` 用于减少无效的网络读取和计算；状态更新仍需单独进行执行版本校验。

### 2.3 状态更新缺少执行版本信息

每个异步回调在更新状态前，都需要确认两个信息：

1. 当前回调属于哪一次执行？
2. 该执行版本是否仍然有效？

`useFunctionPointStream` 使用单调递增的 `runId` 回答这两个问题。

## 3. 核心设计：基于执行版本校验回调有效性

Hook 中保存了一个组件实例级的最新执行编号：

```ts
const streamRunIdRef = useRef(0);
```

每次启动生成时，先生成本次执行的 `runId`，再同步更新当前有效版本：

```ts
const runId = streamRunIdRef.current + 1;
streamRunIdRef.current = runId;
```

两个变量的职责不同：

- `runId` 是本次调用的执行版本，由闭包保存；
- `streamRunIdRef.current` 是组件实例内共享的当前有效版本。

当下一轮请求启动时，Ref 从 `1` 变为 `2`。旧请求的回调仍记得自己是 `1`，因此一比较就知道自己已经过期：

```ts
onChunk: (payload) => {
  if (streamRunIdRef.current !== runId) return;

  // 只有当前批次可以拼接文本、解析数据和更新界面
}
```

该策略只允许最后一次调用提交状态。它不要求旧回调一定停止执行，而是在旧回调执行时跳过状态更新。

### 所有状态更新位置都需要校验

真实异步流程通常有多个写状态的位置。因此，校验不能只放在 `onChunk`。

案例在三个位置进行校验。

第一处，在每个数据分块到达时忽略过期数据：

```ts
onChunk: (payload) => {
  if (streamRunIdRef.current !== runId) return;
  // 更新 streaming 状态
}
```

第二处，在流读取结束、`await` 后的代码恢复执行时再次检查：

```ts
await fetchDifyAIStream(/* ... */);

if (streamRunIdRef.current !== runId || hasError) return;
```

最后一个有效 `chunk` 与最终的 `done` 状态更新之间，用户仍可能启动新请求。如果不重新校验，旧请求可能在 `await` 之后提交最终结果。

第三处，在异常分支中只提交当前执行版本的错误：

```ts
catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') return;

  if (streamRunIdRef.current === runId) {
    updateStep(stepId, {
      status: 'error',
      errorMessage: err instanceof Error ? err.message : '功能点分析失败',
    });
  }
}
```

因此，即使旧请求因非标准取消错误或其他异常进入 `catch`，也不会覆盖新请求的状态。

## 4. 为什么必须是「闭包 + Ref」

这套方案需要同时保存本次调用的执行版本和组件当前的有效版本。前者在本次调用期间保持不变，后者在新请求开始时同步更新。闭包与 Ref 分别承担这两个职责。

### 4.1 闭包：保存本次调用的执行版本

JavaScript 每调用一次 `functionPointStream()`，都会创建一份独立的函数执行上下文和词法环境。本次调用声明的 `runId` 属于这份词法环境：

```ts
const runId = streamRunIdRef.current + 1;

onChunk: () => {
  console.log(runId);
}
```

`onChunk` 引用了外层的 `runId`，因此形成闭包。即使 `functionPointStream()` 已经执行到 `await`，这份词法环境仍不会被回收；事件循环稍后执行 `onChunk` 时，读取的仍是本次调用创建的 `runId`。

下一次调用会创建新的执行上下文和新的 `runId`，不会改写旧闭包里的值。因此，每个回调都能保留其所属调用的执行版本。

但局部 `runId` 只能表示本次调用，无法反映等待网络或 Promise 期间是否启动了新请求。

### 4.2 Ref：提供同步、共享的当前基准

要判断回调是否过期，不同调用还必须访问同一个最新版本号。React 的 Ref 适合保存这类不参与渲染的控制状态：

```ts
const streamRunIdRef = useRef(0);
```

`useRef()` 会在同一个组件实例的后续 render 中返回同一个对象引用。修改 `.current` 只是普通的同步赋值：不会生成新的 render snapshot，也不会触发重渲染。

```ts
streamRunIdRef.current = runId;
```

这行代码执行完后，同一组件实例中所有新旧回调都能从 `.current` 读到最新编号。JavaScript 的 run-to-completion 机制还保证了这次同步赋值不会在执行到一半时被另一个回调插入。

因此，Ref 提供了一个跨 render、跨请求共享并可同步读取的有效版本。

### 4.3 两者如何完成一次判定

异步回调执行时，同时比较本次调用的执行版本和组件当前的有效版本：

```ts
// runId：闭包保存的本次执行版本
// .current：Ref 保存的当前有效版本
if (streamRunIdRef.current !== runId) return;
```

例如，请求 A 的闭包保存 `runId = 1`。请求 B 启动时，将 `streamRunIdRef.current` 同步更新为 `2`。A 的回调之后即使继续执行，比较结果也是 `2 !== 1`，因此会在更新 State 前返回。

这就是组合的关键：

- 闭包让每个回调保留所属调用的执行版本；
- Ref 让所有回调读取同一个当前有效版本。

该机制需要同时具备固定的本次执行版本和同步可读的当前有效版本。闭包 + Ref 是 React 函数组件中的一种直接实现，也可以使用外部 store、共享 token 等方式实现相同的版本校验。

### 4.4 为什么不用 State 保存最新 runId

React 函数组件的每次 render 都是一份独立快照。事件处理函数和异步回调会捕获创建它们那次 render 中的 State 值：

```ts
setRunId(nextRunId);
console.log(runId); // 当前执行上下文里仍是旧值
```

`setState` 提交的是一次更新请求，React 会在之后调度并批处理渲染；它不会同步修改当前闭包里的 `runId`。如果把版本判断依赖于 State，既容易遇到 stale closure，又会为一个不参与 UI 展示的内部标识制造额外渲染。

Ref 则绕开 render snapshot：旧回调虽然捕获了旧 render 中的变量，却持有同一个 Ref 对象，因此每次访问 `.current` 都是在读取当前值。

### 4.5 几种方案的差异

| 方案 | 能保存本次执行版本 | 能感知后续调用 | 同步读取最新值 | 自动触发渲染 | 适合承担的职责 |
| --- | --- | --- | --- | --- | --- |
| 仅局部变量 | 是 | 否 | 仅能读取本次调用的值 | 否 | 保存本次执行版本 |
| React State | 可以 | 可以，但回调容易读到 render snapshot 中的旧值 | 否，更新由 React 调度 | 是 | 驱动可视 UI |
| 仅 AbortController | 否 | 只能知道 signal 是否取消 | 是 | 否 | 尽快停止底层工作 |
| 闭包 + Ref | 是 | 是 | 是 | 否 | 判断异步结果是否仍有效 |

React State 并非不能实现版本控制，只是需要额外处理调度和闭包快照问题。对于不参与渲染、只用于仲裁写权限的 `runId`，Ref 更直接。

## 5. AbortController 与执行版本校验的职责

`runId` 校验不能替代 `AbortController`，两者处理不同问题：

```ts
abortRef.current?.abort();

const controller = new AbortController();
abortRef.current = controller;
```

- `abort()` 尽快停止网络读取和后续计算，减少资源浪费；
- `runId` 阻止过期回调产生业务副作用。

`finally` 中还需要校验 controller 的引用：

```ts
finally {
  if (abortRef.current === controller) {
    abortRef.current = null;
  }
}
```

不能无条件执行 `abortRef.current = null`。假设 A 被取消后，B 已经将其 controller 写入 Ref，此时 A 的 `finally` 才执行。无条件清空会移除 B 的 controller，导致之后无法取消 B。引用相等时才执行清理，可以确保当前 `finally` 只清理本次请求创建的 controller。

## 6. 主动取消时，为什么还要让 runId 失效

Hook 暴露的取消函数同时做了两件事：

```ts
const abortCurrent = useCallback(() => {
  abortRef.current?.abort();
  streamRunIdRef.current += 1;
}, []);
```

递增 `runId` 会立即使当前请求的执行版本失效。即使取消操作存在延迟，或者某个回调已经进入任务队列，该回调再次校验时也会跳过状态更新。

这也解释了为什么只写下面一行不够：

```ts
abortRef.current?.abort();
```

停止请求与标记执行版本失效是两个独立操作。

## 7. 可以复用的最小模板

把业务细节拿掉后，这套模式可以缩成一个通用骨架：

```ts
function useLatestAsyncTask() {
  const latestRunIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    const runId = latestRunIdRef.current + 1;
    latestRunIdRef.current = runId;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const isCurrent = () => latestRunIdRef.current === runId;

    try {
      await consumeStream({
        signal: controller.signal,
        onChunk(chunk) {
          if (!isCurrent()) return;
          updateStreamingView(chunk);
        },
      });

      if (!isCurrent()) return;
      updateDoneView();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      if (!isCurrent()) return;
      updateErrorView(error);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    latestRunIdRef.current += 1;
  }, []);

  return { run, cancel };
}
```

这里的执行顺序是：先递增 `runId`，同步使旧请求的版本失效；再通知旧请求取消；最后将新 controller 写入 Ref。即使取消不能立即生效，旧请求也无法通过后续版本校验。

版本校验应位于每个状态更新或其他副作用之前；共享资源清理则应校验资源引用。副作用包括更新 State、写缓存、显示提示、页面跳转和事件上报。如果 `onChunk` 内部存在 `await`，需要在 `await` 之后、执行副作用之前再次校验，而不能只在回调入口校验。

## 8. 适用边界与常见问题

### 8.1 只在请求开始时校验

请求开始时版本有效，但在 `await` 和数据分块之间可能启动新请求。校验需要靠近副作用发生的位置。

### 8.2 只校验成功分支

旧请求的 `catch`、`finally` 同样可能修改新请求的状态或资源引用。错误状态更新需要校验执行版本，资源清理需要校验资源引用。

### 8.3 多个独立任务共用同一个 runId

单一 `runId` 适用于后一次调用替代前一次调用的场景。如果页面允许多个文件并行上传，或多个列表项分别生成内容，应按任务标识分别保存执行版本：

```ts
const runIdsRef = useRef(new Map<string, number>());
```

否则，一个任务启动会错误地让另一个独立任务失效。

### 8.4 使用 Ref 保存 UI 状态

Ref 适合保存不参与渲染的控制信息，其更新不会触发渲染。需要展示的数据仍应存放在 State 或状态管理工具中。

### 8.5 组件卸载时未取消请求

如果底层请求不会自动随组件卸载终止，可在 effect 清理函数中同时取消请求并使当前编号失效，避免无意义的后台工作。

## 9. 总结

处理前端异步竞态时，除了尽量取消旧请求，还需要阻止过期回调提交状态。

在 `useFunctionPointStream` 中：

- 闭包保存每次调用的 `runId`；
- Ref 同步保存当前有效的 `runId`；
- 每次执行异步副作用前比较版本，忽略过期结果；
- AbortController 负责节省资源，`runId` 负责保证业务正确性；
- `finally` 通过 controller 身份比较，避免旧任务误清理新任务的资源。

该模式适用于搜索联想、AI 流式回答、实时预览、请求重试和高频筛选等仅接收最后一次请求结果的场景。
