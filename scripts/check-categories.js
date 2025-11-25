
// import fetch from 'node-fetch'; // Built-in in Node 18+

async function checkCategories() {
    try {
        const response = await fetch('http://localhost:3000/api/movies');
        const movies = await response.json();
        console.log('Movies found:', movies.length);
        movies.forEach(m => {
            console.log(`ID: ${m.id}, Title: ${m.title}, Category: '${m.category}'`);
            // Check char codes to be sure
            if (m.category) {
                console.log(`Category char codes: ${m.category.split('').map(c => c.charCodeAt(0)).join(',')}`);
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

checkCategories();
