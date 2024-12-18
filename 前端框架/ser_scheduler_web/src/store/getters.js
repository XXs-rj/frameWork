const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  loading: state => state.loading.loading,
  name: state => state.user.name
}
export default getters
