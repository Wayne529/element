<template>
  <footer class="baza-xls-footer" :style="{ height }">
    <slot></slot>
  </footer>
</template>

<script>
  export default {
    name: 'ElFooter',

    componentName: 'ElFooter',

    props: {
      height: {
        type: String,
        default: '60px'
      }
    }
  };
</script>
