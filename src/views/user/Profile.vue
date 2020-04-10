<template>
  <v-container>
    <v-row v-if="user">
      <v-col cols="12" sm="12">
        <v-btn to="/accountinfo" class="primary float-right">
          <v-icon small>mdi-circle-edit-outline</v-icon>&nbsp;Edit info
        </v-btn>
      </v-col>
      <v-col cols="12" sm="3" class="text-center">
        <v-avatar size="130px" color="red">
          <v-img v-if="user.image" :src="user.image" />
          <span v-else class="white--text headline">
            {{ user.name[0] }}
          </span>
        </v-avatar>
      </v-col>
      <v-col cols="12" sm="9" class="text-xs-center">
        <h1 class="set-align">{{ user.name }}</h1>
        <h2 class="set-align font-weight-regular">{{ user.designation }}</h2>
        <h3 class="set-align font-weight-regular text-capitalize">
          <v-icon size="1.17em">mdi-map-marker</v-icon>
          {{ user.area }}
        </h3>
        <h3 class="set-align font-weight-regular">
          <v-icon size="1.17em">mdi-cellphone-android</v-icon>
          +88{{ user.phone }}
        </h3>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  computed: {
    user() {
      return this.$store.getters.userState;
    }
  }
};
</script>
<style lang="scss" scoped>
.set-align {
  text-align: left;
  @media (max-width: 600px) {
    text-align: center;
  }
}
</style>
