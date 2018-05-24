<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
  export default {
    methods: {
      deferredMountedTo(parent) {
        for (var i = 0; i < this.$children.length; i++) {
          if (typeof this.$children[i].deferredMountedTo === "function") {
            this.$children[i].deferredMountedTo(parent);
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
