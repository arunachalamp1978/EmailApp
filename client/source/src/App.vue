<template>
  <div id="app">
    <div>
      <md-tabs md-sync-route>
        <md-tab id="tab-dashboard" md-label="Email" to="/">
        </md-tab>
      </md-tabs>
    </div>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 20px;
}
.heading {
  font-weight: normal;
  text-align: left;
  border-bottom: 1px solid #e6e6e6;
}
</style>
