require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;
const HUBSPOT_API = 'https://api.hubapi.com';
const CUSTOM_OBJECT_TYPE = '2-168459956'; // Replace this with your actual object ID

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Home page: show all plant records
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${HUBSPOT_API}/crm/v3/objects/${CUSTOM_OBJECT_TYPE}?properties=name,species,description`, {
            headers: {
                Authorization: `Bearer ${process.env.PRIVATE_APP_ACCESS_TOKEN}`,
            },
        });

        console.dir(response.data.results, { depth: null });

        const plants = response.data.results.map(p => ({
            id: p.id,
            name: p.properties.name,
            species: p.properties.species,
            description: p.properties.description,
        }));

        res.render('homepage', {
            title: 'Plant Table',
            plants,
        });
    } catch (err) {
        console.error('❌ Error fetching custom objects:', err.response?.data || err.message);
        res.status(500).send('Failed to load data');
    }
});

// Show the form
app.get('/update-cobj', (req, res) => {
    res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum' });
});

// Handle form submission
app.post('/update-cobj', async (req, res) => {
    const { name, species, description } = req.body;

    try {
        await axios.post(`${HUBSPOT_API}/crm/v3/objects/${CUSTOM_OBJECT_TYPE}`, {
            properties: { name, species, description },
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PRIVATE_APP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        res.redirect('/');
    } catch (err) {
        console.error('Error creating custom object record:', err.message);
        res.status(500).send('Failed to create record');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
