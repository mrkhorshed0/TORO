function AppsGames() {
  const playStoreApps = [
    // এখানে আপনার অ্যাপগুলো যোগ করুন। উদাহরণ:
    // { name: 'App Name', description: 'Short description', link: 'https://play.google.com/store/apps/details?id=com.example' },
  ]

  const amazonApps = [
    // এখানে Amazon Appstore-এর অ্যাপগুলো যোগ করুন। উদাহরণ:
    // { name: 'App Name', description: 'Short description', link: 'https://www.amazon.com/dp/B0XXXXXXX' },
  ]

  return (
    <section className="section">
      <div className="container">
        <h1 className="page-title">Apps &amp; Games</h1>
        <p className="page-sub">
          All Toro applications and games are published on Google Play Store and
          Amazon Appstore. Browse our catalogue below.
        </p>

        <h2 className="section-title left">Google Play Store</h2>
        {playStoreApps.length > 0 ? (
          <div className="grid grid-3">
            {playStoreApps.map((app, i) => (
              <div className="card" key={`play-${i}`}>
                <h3>{app.name}</h3>
                <p>{app.description}</p>
                <a
                  href={app.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  View on Play Store
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p>Our Google Play Store catalogue is being updated.</p>
        )}

        <h2 className="section-title left" style={{ marginTop: '48px' }}>
          Amazon Appstore
        </h2>
        {amazonApps.length > 0 ? (
          <div className="grid grid-3">
            {amazonApps.map((app, i) => (
              <div className="card" key={`amazon-${i}`}>
                <h3>{app.name}</h3>
                <p>{app.description}</p>
                <a
                  href={app.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  View on Amazon
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p>Our Amazon Appstore catalogue is being updated.</p>
        )}
      </div>
    </section>
  )
}

export default AppsGames
