import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import ejs from 'ejs';

dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const PORT = 3000;
const API_URL = process.env.API_URL;
const MASTER_KEY = process.env.MASTER_KEY;
const ACCESS_KEY = process.env.ACCESS_KEY;

//Render form page
app.get(`/post`, (req, res) => {
  res.render('post.ejs');
});

//Get 1 random post from array inside the bin
app.get(`/`, async (req, res) => {

      try {
        const response = await axios.get(`${API_URL}`, {
          headers: {
            'X-Access-Key': `${ACCESS_KEY}`,
          },
        });
        
        // Access the posts array
        const posts = response.data.record.posts || []; // Fallback to empty array if no posts

        // Select a random post
        const randomPost = posts.length > 0 ? posts[Math.floor(Math.random() * posts.length)] : null;

        res.render('index', {data: randomPost});
      } catch (error) {
        console.log(error);
        res.render('index.ejs', { error: error.response ? error.response.data : 'An error occurred' });
      };
});

//Post new item to array
app.post(`/post`, async (req, res) => {
    try {
      //Get the existing posts from the bin
      const existingPosts = await axios.get(`${API_URL}`, {
        headers: {
            'X-Access-Key': `${ACCESS_KEY}`,
        }
    });

      //Create the new post
      const newPost = {
        id: Date.now(),
        user: req.body.clientUsername,
        post: req.body.clientPost,
      }

      //Append the new post to the existing array
      const updatedPosts = [...existingPosts.data.record.posts, newPost];
      
      //Send the updated posts back to the API
      const updatePosts = await axios.put(`${API_URL}`, {
        posts: updatedPosts,
      }, {
        headers: {
          'X-Master-Key': `${MASTER_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      res.redirect('/');
  } catch (error) {
    console.error('Error posting data to API:', error.response ? error.response.data : error);
    res.status(500).send('Error posting data to API');
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });