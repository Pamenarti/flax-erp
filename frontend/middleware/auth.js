export default function ({ store, redirect, route, $auth }) {
  // Kullanıcı oturum açmadıysa, login sayfasına yönlendir
  if (!$auth.loggedIn) {
    return redirect(`/login?redirect=${route.fullPath}`)
  }
}
