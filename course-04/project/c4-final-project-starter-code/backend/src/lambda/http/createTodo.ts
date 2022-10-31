import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
// import { createTodo } from '../../businessLogic/todos'
import * as uuid from 'uuid'
import { createTodo } from '../../helpers/todosAcess'

const bucket = process.env.ATTACHMENT_S3_BUCKET 

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    const todoId = uuid.v4()
    const tdItem = {
      todoId: todoId,
      userId: getUserId(event),
      createdAt: new Date().toISOString(),
      done: false,
      attachmentUrl: `http://${bucket}.s3.amazonaws.com/${todoId}`,
      ...newTodo
    }
      
    const createdItem = await createTodo(tdItem)
    
    return {
      statusCode: 201,
      body:JSON.stringify({
        'item': createdItem
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
