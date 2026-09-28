---
slug: abort-frontend-async-race
date: 2026-09-10
tag: ['前端', 'Hook', '代码设计']
column: 教程
detail: '为什么每次发起新请求前都调用了 abortController.abort()，页面状态依然会被上一次请求污染？本文从「网络中断 ≠ 终止回调执行」的根因讲起：已进入微任务队列的回调无法撤销、catch 分支同样包含业务逻辑、回调自身缺乏版本识别能力。接着对比 isMounted 生命周期判断与 Run ID 版本控制的差异，给出「闭包保存单次调用序号 + Ref 维护全局最新有效序号」的通用校验方案，附可直接复用的 useStreamRunner 模板、连续两次请求的执行时序拆解表，以及「所有异步分支都要校验」「主动取消时同步递增序号」「多任务并行不适用」等关键注意事项。'
---

# Abort 之后的前端异步竞态

在前端开发中，只要涉及到异步操作与高频用户交互，很容易遇到这类时序问题：

- 用户在输入框快速搜索，输入 cat 后删掉改成 dog，结果列表先渲染了 dog 的搜索结果，半秒后又被迟到的 cat 响应覆盖。
- 用户在 AI 生成场景中连续点击“重新生成”，文本在两段完全不同的生成内容之间交替闪烁。
- 第一次请求因为弱网超时报错，而用户早就发起了第二次重试并成功拿到数据，结果第一次请求抛出的错误弹窗突然弹出，把当前正常的界面改成了“网络异常”。

很多开发者的第一反应是：“每次发起新请求前我都调用了 `abortController.abort()`，为什么页面状态依然会被上一次请求污染？”

本文将分析为什么底层的网络中断无法完全阻断业务层的状态写入，并提供一套基于 **闭包 + Ref** 的通用时序校验方案。

## 一、问题根因：网络中断 ≠ 终止回调执行

`AbortController` 能够有效取消网络请求，但它无法直接控制 JavaScript 运行时已排队的异步微任务：

- **已进入事件循环的任务无法撤销**：当调用 `abort()` 时，如果某个分块数据（Chunk）或者 Promise 回调已经进入了微任务队列，或者正在被 JavaScript 引擎执行，它依然会按序执行完毕。
- **异常捕获同样包含业务逻辑**：`abort()` 通常会触发底层抛出 `AbortError`，导致代码走入 `catch` 分支。如果在 `catch` 中直接调用了 `setStatus('error')` 等状态更新函数，即便请求已被取消，旧逻辑依然会修改当前界面。
- **回调缺乏版本识别能力**：异步回调在被唤醒执行时，无法感知自身属于哪一次发起的请求，也无法判断当前带回的数据是否仍然有效。

## 二、从生命周期判断到请求版本控制（Run ID）

在处理异步请求与组件生命周期时，常见的防失效写法如下：

```js
useEffect(() => {
  let isMounted = true;
  fetchData().then(res => {
    if (!isMounted) return; // 若组件已卸载，则不执行状态更新
    setData(res);
  });
  return () => { isMounted = false; };
}, []);
```

这种 `isMounted` 方案解决的是组件生命周期的有效性：判断组件是否已被卸载。如果已卸载，则放弃后续的 setState。

但在高频交互（流式生成、实时搜索、连续重试）中，组件始终处于挂载状态，核心矛盾转变为异步响应的时效性与先后顺序：虽然组件没有卸载，但用户已经发起了后续请求，先前的异步响应已属于过期数据。

因此，原本用于标识挂载状态的布尔值，需要转变为单调递增的请求序号（Run ID），用来标识异步请求的版本。

## 三、方案设计：为什么选择「闭包 + Ref」

实现请求的时序校验，需要两项基础能力：

- **记录单次调用的序号**：利用函数闭包。在发起请求时声明一个局部变量，保存当前的序号。无论后续该函数被再次调用多少次，当前闭包内的序号都不会改变。
- **维护全局最新的有效序号**：利用 React Ref。Ref 在组件整个生命周期中保持可变引用，修改它的值不会触发不必要的重新渲染，且异步回调在任何执行阶段都能同步读取到最新的 `.current` 值。

**为什么不使用 State？**

如果使用 `useState` 存储当前有效序号，更新序号会触发多余的组件重渲染；同时，在异步回调内部直接读取 state 容易受到闭包旧值（Stale Closure）的影响，无法实时获取最新状态。

## 四、通用代码实现

以下是一套适用于 Fetch Stream、SSE 或普通 Promise 的通用校验模板：

```js
import { useRef } from 'react';

export function useStreamRunner() {
  // 1. 跨请求共享：记录当前组件认可的最新请求序号
  const latestRunIdRef = useRef(0);

  const startTask = async (params: any) => {
    // 2. 发起新请求：序号自增，并通过局部变量固化在当前函数闭包中
    const currentRunId = ++latestRunIdRef.current;

    try {
      await fetchStream(params, {
        onChunk: (chunk) => {
          // 3. 数据到达：校验当前闭包序号与最新有效序号是否一致
          if (currentRunId !== latestRunIdRef.current) return;
          updateContent(chunk);
        },
      });

      // 4. 请求完成：校验通过后再执行完成态更新
      if (currentRunId !== latestRunIdRef.current) return;
      setStatus('done');
    } catch (err) {
      // 5. 异常处理：避免 AbortError 或旧请求失败覆盖新状态
      if (currentRunId !== latestRunIdRef.current) return;
      setStatus('error');
    }
  };

  const cancelTask = () => {
    // 6. 主动取消：递增序号使在途回调失效，同时调用底层中断
    latestRunIdRef.current += 1;
    abortController.abort();
  };

  return { startTask, cancelTask };
}
```

### 连续发起的执行时序拆解

以用户快速连续触发两次请求为例：

| 时序 | 操作与状态变化 | 闭包局部 `currentRunId` | `latestRunIdRef.current` | 校验逻辑与结果 |
| --- | --- | --- | --- | --- |
| T1 | 用户第 1 次发起请求 | 1 | 1 | 序号一致，正常接收分块并更新状态 |
| T2 | 用户发起第 2 次请求 | 2 | 2 | 序号自增为 2，第 2 次请求开始执行 |
| T3 | 第 1 次请求的迟延数据到达 | 1 | 2 | 1 !== 2，判定为过期回调，直接 return 丢弃 |
| T4 | 第 1 次请求被中止抛出异常 | 1 | 2 | 1 !== 2，拦截错误处理，不重置界面状态 |
| T5 | 第 2 次请求处理完毕 | 2 | 2 | 序号一致，执行最终的完成态更新 |

无论网络延迟如何变化，旧请求的回调均会被版本校验拦截，只有最新一次请求能够提交状态更新。

## 五、关键注意事项

### 1. 所有异步分支都要做版本校验

很多开发者只在数据接收回调中做了序号校验，却忽略了 `catch` 与 `finally` 分支：

```js
try {
  // onChunk 中做了版本校验
} catch (err) {
  // 漏校验：上一次超时请求的错误，会直接把新请求正在渲染的界面重置为失败态
  setError(err.message);
}
```

规范：所有涉及状态变更（setState、Store 更新、Toast 提示）的逻辑节点，都应前置执行 `if (currentRunId !== latestRunIdRef.current) return;`。

### 2. 主动取消时同步递增序号

在手动调用中断逻辑（如点击“停止生成”）时，除了调用 `controller.abort()`，应同步递增 Ref 的序号：

```js
latestRunIdRef.current += 1;
```

这样可以确保由 `abort()` 触发并进入下一个事件循环周期的 `catch` 或残余回调被判定为过期并直接退出。

### 3. 适用场景与边界

**适用场景**：单结果呈现、后发优先的异步逻辑。例如 AI 对话流式输出、搜索下拉自动联想、Tab 切换异步加载。

**不适用场景**：多任务独立并行的逻辑。例如批量上传多个文件并独立展示各自的进度。这类场景需要为每个任务分配唯一的 taskId，通过 Map 分别维护任务状态，而不是通过单一递增序号让先前的任务失效。

## 六、总结

解决前端高频交互中的异步竞态问题，核心在于建立可靠的版本校验机制：

- **闭包**：记录当前回调发起的版本；
- **Ref**：保存当前系统认可的最新版本。

通过两者结合，配合 AbortController 节省不必要的网络传输开销，即可低成本地解决旧异步响应覆盖新状态的问题。
