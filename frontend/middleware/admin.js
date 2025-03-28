export default function ({ store, redirect, $auth }) {
  // Kullanıcı oturum açmamışsa, login sayfasına yönlendir
  if (!$auth.loggedIn) {
    return redirect('/login')
  }
  
  // Kullanıcı admin değilse, dashboard'a yönlendir
  if ($auth.user.role !== 'admin') {
    return redirect('/dashboard')
  }
}
