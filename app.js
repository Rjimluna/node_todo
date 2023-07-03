const express = require('express');
const bodyParser = require('body-parser');
const TodoItem = require('./models/TodoItem');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Create a TODO item
app.post('/todo', async (req, res) => {
  try {
    const { title } = req.body;
    const todo = await TodoItem.create({ title });
    res.status(201).json({ message: 'TODO item created successfully.' });
  } catch (error) {
    console.error('Failed to create TODO item', error);
    res.status(500).json({ message: 'Failed to create TODO item.' });
  }
});

// Get TODO items with pagination
app.get('/todos', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const limit = parseInt(pageSize);
    const offset = (parseInt(page) - 1) * limit;

    const { count, rows: todos } = await TodoItem.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      totalItems: count,
      totalPages,
      currentPage: parseInt(page),
      todos,
    });
  } catch (error) {
    console.error('Failed to get TODO items', error);
    res.status(500).json({ message: 'Failed to get TODO items.' });
  }
});

// Update a TODO item
app.put('/todo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const [rowsUpdated] = await TodoItem.update(
      { title, completed },
      { where: { id } }
    );

    if (rowsUpdated === 0) {
      return res.status(404).json({ message: 'TODO item not found.' });
    }

    res.json({ message: 'TODO item updated successfully.' });
  } catch (error) {
    console.error('Failed to update TODO item', error);
    res.status(500).json({ message: 'Failed to update TODO item.' });
  }
});

// Delete a TODO item
app.delete('/todo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rowsDeleted = await TodoItem.destroy({ where: { id } });

    if (rowsDeleted === 0) {
      return res.status(404).json({ message: 'TODO item not found.' });
    }

    res.json({ message: 'TODO item deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete TODO item', error);
    res.status(500).json({ message: 'Failed to delete TODO item.' });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});