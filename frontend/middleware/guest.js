export default function ({ store, redirect, $auth }) {
  // Kullanıcı zaten oturum açmışsa, dashboard'a yönlendir
  if ($auth.loggedIn) {
    return redirect('/dashboard')
  }
}
