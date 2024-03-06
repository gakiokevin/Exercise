const express = require('express')
const app = express()
const cors = require('cors')
const moongose = require('mongoose')
const { Schema } =  moongose
require('dotenv').config()

moongose.connect(process.env.MONGO_DB_URI);

const db = moongose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

const UserSchema = new Schema({
  username:{type:String}
  
})
const User = moongose.model('users',UserSchema)

const ExerciseSchema = new Schema({
  user_id:{type:String,required:true},
  description:{type:String},
  duration:{type:Number},
  date:Date

})
const Exercise = moongose.model('exercise',ExerciseSchema)

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended:true}))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users',async (req,res)=>{
 const users = await User.find({}).select('_id username')
 if(!users){
  res.send('no users')
 }else {
  res.json(users)
 }
})




app.post('/api/users',async (req,res)=>{

const userObj = new User({
  username:req.body.username
})
try{
  const user = await userObj.save()
  console.log(user)
  res.json(user)
}catch(error){
  console.log(error)
}

})
app.post('/api/users/:_id/exercises',async (req,res)=>{
  const id = req.params._id
  const { description,duration, date } = req.body
  try{
    const user = await User.findById(id)
    if(!user){
      res.send('user does not exist')
    }else {
      const exerciseObj = new Exercise({
        user_id:user._id,
        description,
        duration,
        date:date ? new Date(date) : new Date() 
      })
      const exercise= await exerciseObj.save()
      res.json( {
        _id:user._id,
        username:user.username,
        description: exercise.description,
        duration: exercise.duration,
        date:new Date(exercise.date).toDateString()
      })
    }
  }catch(error){
    console.log(error)
    res.send(' an error occured')

  }

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
