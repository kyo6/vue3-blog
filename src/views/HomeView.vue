<script setup>
import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
  <main>
    <div class="relative max-w-5xl mx-auto pt-20 sm:pt-24 lg:pt-32">
      <TheWelcome />

      <article class="prose prose-zinc dark:prose-dark">
        <h1>欢迎来到我的博客</h1>
        <p>这是一段普通的文字。Typography 插件会自动为其添加合适的间距和字体样式。</p>

        <h2>这是一个二级标题</h2>
        <p>另一段文字，紧随二级标题之后。</p>

        <h3>这是一个三级标题</h3>
        <p>这里有一些<strong>粗体文字</strong>和<em>斜体文字</em>。</p>

        <ul>
          <li>无序列表项 1</li>
          <li>
            无序列表项 2
            <ul>
              <li>嵌套列表项 A</li>
              <li>嵌套列表项 B</li>
            </ul>
          </li>
        </ul>

        <ol>
          <li>有序列表项 1</li>
          <li>有序列表项 2</li>
        </ol>

        <p>这里是一个链接：<a href="https://example.com">访问 Example.com</a>。</p>

        <blockquote>
          <p>"这是一个引用块，通常用来突出显示重要的话语或引述。"</p>
          <footer>— 引用来源</footer>
        </blockquote>

        <p>这是行内代码 <code>&lt;button&gt;click me&lt;/button&gt;</code> 和一个代码块：</p>
        <pre><code>// 这是一段 JavaScript 代码
      function add(a, b) {
        return a + b;
      }
      </code></pre>
        <p>最后是一条分割线：</p>
        <hr />
        <p>分割线之后的内容。</p>
      </article>
    </div>
  </main>
</template>
