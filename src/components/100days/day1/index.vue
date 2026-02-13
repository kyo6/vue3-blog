<template>
  <div class="frame">
    <div class="center">
      <div class="redhat number-stack">
        <div class="uno">1</div>
        <div class="cero">0</div>
        <div class="cero-dos">0</div>
      </div>
      <div class="cregular">DAYS</div>
      <div class="cbold">CSS CHALLENGE</div>
    </div>
  </div>
</template>

<style scoped>
.redhat {
  font-family: 'Red Hat Display', sans-serif;
  font-optical-sizing: auto;
  font-weight: 900;
  font-style: normal;
}

.cregular {
  font-family: 'Courier Prime', monospace;
  font-weight: 600;
  font-style: normal;
}

.cbold {
  font-family: 'Courier Prime', monospace;
  font-weight: 600;
  font-style: normal;
}

.frame {
  width: 400px;
  height: 400px;
  border-radius: 2px;
  box-shadow: 4px 8px 16px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: #6b59e0;
  background: radial-gradient(at left bottom, #6b59e0, #31cddc);
  color: #fff;
  font-family: 'Open Sans', Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.number-stack {
  display: flex;
  align-items: center;
  height: 90px;
  margin-bottom: 14px;
}

.uno,
.cero,
.cero-dos {
  font-family: 'Red Hat Display', sans-serif;
  font-weight: 900;
  font-size: 140px;
  position: relative;
  background: none;
  text-shadow: 6px 0 10px rgba(159, 165, 179, 0.64);
}

.uno {
  z-index: 3;
}

.uno::before {
  content: '';
  position: absolute;
  width: 23px;
  height: 97px;
  background: #fff;
  left: 22px;
  top: 33px;
  transform: rotate(0deg);
  z-index: 1;
  border-top-left-radius: 11px;
  box-shadow: -1px 0 6px rgba(159, 165, 179, 0.64);
}

.cero {
  z-index: 2;
  margin-left: -15px;
}

.cero-dos {
  z-index: 1;
  margin-left: -15px;
}

.cregular {
  font-family: 'Courier Prime', monospace;
  font-weight: 700;
  font-size: 82px;
  line-height: 60px;
  margin: 0;
  text-transform: uppercase;
}

.cbold {
  font-family: 'Courier Prime', monospace;
  font-weight: 700;
  font-size: 25px;
  line-height: 25px;
  margin: 0;
  text-transform: uppercase;
}
</style>
