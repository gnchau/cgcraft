const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
app.use(express.static('project'));
app.listen(PORT);