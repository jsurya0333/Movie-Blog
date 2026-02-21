const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
   title : {
      type : String,
      required : true
   },
   description :{
      type : String
   },
   releaseDate :{
      type : Date,
      required : true
   },
   runTime :{
      type : String,
      required : true
   },
   createdAt : {
      type : Date,
      required : true,
      default : Date.now
   },
   coverImage : {
      type : Buffer,
      required : true
   },
   coverImageType :{
       type : String,
       required : true
   },
   director : {
      type : mongoose.Schema.Types.ObjectId,
      required : true,
      ref : 'Director'
   },
   postedBy:{
      type : mongoose.Schema.Types.ObjectId,
      required:true,
      ref  : 'User'
   }
})

/*
   
   movieSchema.pre('remove',function(next){
   Movie.find({postedBy : this.id},(err,movies) =>{
      if(err){
         next(err)
      }else if(movies.postedBy !== this.id){
        next(new Error('U cannot delete this' ))
      }else{
         next()
      }
   })
 }) */

movieSchema.virtual('coverImagePath').get(function() {
   if (this.coverImage != null && this.coverImageType != null) {
     return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
   }
 })
 
module.exports = mongoose.model('Movie', movieSchema)
