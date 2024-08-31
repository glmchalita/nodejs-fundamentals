import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body
    
      if (!title) {
        return res.writeHead(400).end(
          JSON.stringify({message: 'title is required'})
        )
      }

      if (!description) {
        return res.writeHead(400).end(
          JSON.stringify({message: 'description is required'})
        )
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    }
  },
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search
      } : null)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body 
      const isEmpty = (str) => !str || str.trim().length === 0;

      if (isEmpty(title) && isEmpty(description)) {
        return res.writeHead(400).end(
          JSON.stringify({message: 'title or description are required'})
        )
      }

      const [task] = database.select('tasks', { id })      

      if (!task) {
        return res.writeHead(404).end(
          JSON.stringify({message: 'ID not found'})
        )
      }

      database.update('tasks', id, {
        ...task,
        title: !isEmpty(title) ? title : task.title,
        description: !isEmpty(description) ? description : task.description,
        updated_at: new Date()
      })
      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params      
      const [task] = database.select('tasks', { id })      
      
      if (!task) {
        return res.writeHead(404).end(
          JSON.stringify({message: 'ID not found'})
        )
      }


      database.update('tasks', id, {
        ...task[0],
        completedAt: task[0].completedAt ? null : new Date()
      })

      return res.writeHead(204).end()
   }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const task = database.select('tasks', { id })      
       
      if (task.length === 1) {
        database.delete('tasks', id)
        return res.writeHead(204).end()
      }

      return res.writeHead(404).end()
    }
  }
]
