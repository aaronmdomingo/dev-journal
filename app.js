const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');


const homeStartingContent = 'I created this to improve my Bootstrap and MongoDB / Node.js Knowledge. I also wanted to keep track of my journey to becoming a developer, this project combines both! Feel free to check out my entries and give me some feedback. Thanks!';
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});
mongoose.set('useFindAndModify', false);


const postSchema = {
  _id: String,
  title: String,
  content: String,
  date: String
}

const Post = mongoose.model('Post', postSchema);


//HOME
app.get('/', (req, res) => {
  Post.find({}, (err, foundPosts) => {
    let latestPost = [];
    if (foundPosts.length > 5) {
      for (var i = foundPosts.length - 1; i > foundPosts.length - 6; i--) {
        latestPost.push(foundPosts[i]);
      }
    } else {
      for (var i = foundPosts.length - 1; i >= 0; i--) {
        latestPost.push(foundPosts[i]);
      }
    }
    res.render('home' , {
    startingContent: homeStartingContent,
    posts: latestPost
    });
  })
})

//CONTACT
app.get('/contact', (req, res) => {
  res.render('contact', {
    about: aboutContent
  })
})

//ALL ENTRIES
app.get('/all', (req, res) => {
  Post.find({}, (err, foundPosts) => {
    const newPost = [];
    for (var i = foundPosts.length-1 ; i >= 0 ; i--) {
      newPost.push(foundPosts[i]);
    }
    res.render('all', {
      posts: newPost
    })
  })
})

//COMPOSE
app.get('/compose', (req, res) => {
  res.render('compose', {
  })
})

app.post("/compose", function(req, res){
  let now, months, month, year, day, current;

  now = new Date()
  month = now.getMonth() + 1;
  year = now.getFullYear();
  day = now.getDate();
  current = `${month} / ${day} / ${year}`;

  const post = new Post ({
    _id: req.body.postTitle,
    title: req.body.postTitle,
    content: req.body.postBody,
    date: current
  });


  post.save();
  res.redirect("/");
});

app.get(`/posts/:postID`, (req, res) => {
  const requestedID = req.params.postID;

  Post.findOne({ _id: requestedID }, (err, post) => {
    if (!err) {
      res.render(`post`, {
        title: post.title,
        body: post.content,
        date: post.date,
        id: post._id
      })
    } else {
      res.send(err)
    }
  })
})

// DELETE
app.get('/delete/:postID', (req, res) => {
  const requestedID = req.params.postID;
  Post.findOneAndRemove({_id: requestedID}, (err, post) => {
    if (!err) {
      res.redirect('/all');
    } else {
      res.send(err);
    }
  })
})

//EDIT
app.get('/edit/:postID', (req, res) => {
  const requestedID = req.params.postID;
  Post.findOne({_id: requestedID}, (err, post) => {
    if (!err) {
      res.render(`edit`, {
        title: post.title,
        body: post.content,
        date: post.date,
        id: post._id
      })
    } else {
      res.send(err);
    }
  })
})

app.post('/edit', (req, res) => {
  const requestedID = req.body.oldTitle;

  Post.findOne({_id: requestedID}, (err, post) => {
    if (!err) {
      post.title = req.body.editTitle;
      post.content = req.body.editBody;
      post.save();
      res.redirect('/all');
    } else {
      res.send(err);
    }
  })
})

app.listen(3100, function() {
  console.log("Server started on port 3100");
});
