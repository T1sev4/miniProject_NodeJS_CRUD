const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3001;


// подключение в базу данных

mongoose
  .connect('mongodb://localhost:27017/shop')
  .then(() => {
    console.log('Connected to mongoDB');
  })
  .catch((e) => {
    console.log('failed connect to mongoDb');
  });

// получаем данные именно в формате urlencoded


const shopShema = new mongoose.Schema({
  title: String,
  price: Number,
  sale: Number,
  imgUrl: String,
});

const shop = mongoose.model('products', shopShema);

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded());

app.post('/newProduct', async (req, res) => {
  if (req.body.title != 0) {
    try{
      await new shop({
        title: req.body.title,
        price: req.body.price,
        sale: req.body.sale,
        imgUrl: req.body.imgUrl,
      }).save();
      res.redirect('/');
    }catch(error){
      res.send(error)
    }
  } else {
    res.redirect('/newProduct?error=1');
  }
});

app.post('/editProduct', async (req, res) => {
  await shop.updateOne(
    {
      _id: req.body.id,
    },
    {
      title: req.body.title,
      price: +req.body.price,
      sale: +req.body.sale,
      imgUrl: req.body.imgUrl,
    }
  );
  res.redirect('/');
});

app.delete('/delete/:id', async (req, res) => {
  await shop.deleteOne({ _id: req.params.id });
  res.status(200).send('ok');
});

app.get('/deleteProd/:id', async (req, res) => {
  await shop.deleteOne({ _id: req.params.id });
  res.redirect('/');
});



app.get('/', async (req, res) => {
  const data = await shop.find();
  res.render('products.ejs', {
    sectionTitle: 'chairs',
    navigationTitle: 'products',
    data,
  });
});

app.get('/newProduct', (req, res) => {
  res.render('newProduct.ejs', {
    sectionTitle: 'Добавить товар',
    navigationTitle: 'new product',
    btnName: 'Добавить продукт',
  });
});
app.get('/editProduct/:id', async (req, res) => {
  const productData = await shop.findById(req.params.id);
  res.render('editProduct.ejs', {
    sectionTitle: 'Редактирование товара',
    navigationTitle: 'edit product',
    btnName: 'Сохранить изменения',
    data: productData,
  });
});

app.get('/profile/:id', async (req, res) => {
  const productData = await shop.findById(req.params.id);
  res.render('profile.ejs', {
    sectionTitle: 'chairs',
    navigationTitle: 'products',
    data: productData,
  });
});

app.get('/*', function (req, res) {
  res.render('notFound', { navigationTitle: '404' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
