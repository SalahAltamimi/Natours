const fs = require('fs');
const Tours = require('../../modules/toursModule');
const Review = require('../../modules/reviewModule');
const connectDB = require('../../database');
const Users = require('../../modules/userModule');

connectDB();
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importdata = async () => {
  try {
    await Tours.create(tours);
    await Users.create(users);
    await Review.create(reviews);
    console.log('successfuly created');
    process.exit(-1);
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }
};
const deletedata = async () => {
  try {
    await Tours.deleteMany();
    await Users.deleteMany();
    await Review.deleteMany();
    console.log('successfuly deleted');
    process.exit(-1);
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }
};

if (process.argv[2] === '--import') {
  importdata();
} else if (process.argv[2] === '--delete') {
  deletedata();
}
