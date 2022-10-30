import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
const docClient:DocumentClient = createDynamoDBClient()
const todosTable = process.env.TODOS_TABLE
const indexTable = process.env.TODOS_CREATED_AT_INDEX

export async function getTodosForUser(userId: string): Promise<TodoItem []>{
    const resultSet = await docClient
    .query({
        TableName: todosTable,
        //IndexName: indexTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()

    if(resultSet.Count !== 0 ){
        return resultSet.Items as TodoItem[]
    }
    

    return null
}

export async function deleteTodo(userId: string): Promise<TodoItem []>{
    const result = await docClient
    .query({
        TableName: todosTable,
        IndexName: indexTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()

    if(result.Count !== 0 ){
        return result.Items as TodoItem[]
    }

    return null
}

export async function updateTodo(todoItem:TodoItem){
    await docClient
    .update({
        TableName: todosTable,
        Key:{
            todoId: todoItem.todoId,
            userId: todoItem.userId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
            ':attachmentUrl': todoItem.attachmentUrl
        }
    })
    //.promise()

    // if(result.Count !== 0 ){
    //     return result.Items as TodoItem[]
    // }

    // return null
}


export async function createTodo(todoItem: TodoItem) :Promise<TodoItem>{
    await docClient
    .put({
        TableName: todosTable,
        Item: todoItem
    })
    .promise()

    return todoItem
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }

  export async function getTodoById(todoId:string) :Promise<TodoItem>{    

    const resultSet = await docClient
    .query({
        TableName: todosTable,
        IndexName: indexTable,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues:{
            ':todoId':todoId
        }
    })
    .promise()
    if (resultSet.Count !== 0)
        return resultSet.Items[0] as TodoItem
    return null
  }