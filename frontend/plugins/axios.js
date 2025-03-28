export default function ({ $axios, redirect, $auth }) {
  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status)

    // 401 - Unauthorized: Oturum açma sayfasına yönlendir
    if (code === 401) {
      $auth.logout()
      redirect('/login')
    }

    // 403 - Forbidden: Dashboard'a yönlendir
    if (code === 403) {
      redirect('/dashboard')
    }

    return Promise.reject(error)
  })

  // İstek öncesi işlemler
  $axios.onRequest(config => {
    console.log(`${config.method.toUpperCase()} ${config.url}`)
    return config
  })
}
