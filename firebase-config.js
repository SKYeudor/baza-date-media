const firebaseConfig = {
    apiKey: "AIzaSyDwdfnfWiVifp2uzXXsw1eF8bnK6R4lAGA",
    authDomain: "biblioteca-media-personala.firebaseapp.com",
    projectId: "biblioteca-media-personala",
    storageBucket: "biblioteca-media-personala.firebasestorage.app",
    messagingSenderId: "864966620811",
    appId: "1:864966620811:web:64836266951afb37eec68e"
};

firebase.initializeApp(firebaseConfig);
const firestoreDB = firebase.firestore();

let isAdmin = false;
let currentCategory = 'filme';
let activeFilters = {};
let currentSortKey = 'titlu';
let currentSortOrder = 'asc';
let database = { filme: [], muzica: [], carti: [] };

function saveDatabase() {
    firestoreDB.collection('biblioteca_media').doc('date').set(database);
}

function loadDatabase() {
    firestoreDB.collection('biblioteca_media').doc('date').get().then((docSnap) => {
        if (docSnap.exists) {
            database = docSnap.data();
            if (!database.filme) database.filme = [];
            if (!database.muzica) database.muzica = [];
            if (!database.carti) database.carti = [];
        } else {
            database = { filme: [], muzica: [], carti: [] };
            database.filme.push({
                cod: "F25-001",
                titlu: "Exemplu Catalog",
                tip: "Film",
                status: "Vizionat",
                gen: "Drama",
                an: "2025",
                regizor: "Regizor Test",
                durata: "120 min",
                actori: "Actor Exemplu",
                imdb: "https://www.imdb.com",
                cinemagia: "https://www.cinemagia.ro",
                url_img: ""
            });
            saveDatabase();
        }
        resetFiltersObject();
        switchCategory('filme');
    });
}
