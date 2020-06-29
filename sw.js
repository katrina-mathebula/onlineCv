const staticCacheName = 'site-static-v2';
const dynamicCacheName = 'site-dynamic-v1';
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/css/styles.css',
    '/images/logo1.png',
    '/images/me.JPG',
    'https://fonts.googleapis.com/css2?family=Muli&display=swap',
    '/404.html',
];

//cache size limit function
const limitCachceSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCachceSize(name, size));
            }
        })
    })
};

//install service worker
self.addEventListener('install', evt => {
    //console.log('service worker has been installed');
    evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
        console.log('caching shell assets');
        cache.addAll(assets);
    })
    );  
});

//activate event
self.addEventListener('activate', evt => {
    //console.log('service worker has been activated');
    evt.waitUntil(
    caches.keys().then(keys => {
        //console.log(keys);
        return Promise.all(keys
            .filter(key => key !== staticCacheName && key !== dynamicCacheName)
            .map(key => caches.delete(key))               
    )
    })
    );
});

//fetch event
self.addEventListener('fetch', evt => {
    //console.log('fetch event', evt);
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).then(fetchRes => {
            return caches.open(dynamicCacheName).then(cache => {
                cache.put(evt.request.url, fetchRes.clone());
                limitCachceSize(dynamicCacheName, 15);
                return fetchRes;
            })
        });
    }).catch(() => caches.match('/404.html'))
    );
});