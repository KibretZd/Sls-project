import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
// import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)
// const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess{
    constructor (
        private readonly docClient:DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly indexTable = process.env.TODOS_CREATED_AT_INDEX)
        {

        }
    
    async getTodosForUser(userId: string): Promise<TodoItem []>{
        const resultSet = await this.docClient
        .query({
            TableName: this.todosTable,
            //IndexName: this.indexTable,
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
    
    async deleteTodo(userId: string): Promise<TodoItem []>{
        const result = await this.docClient
        .query({
            TableName: this.todosTable,
            IndexName: this.indexTable,
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
    
    async updateTodoAttachmentUrl(todoItem:TodoItem){
        await this.docClient
        .update({
            TableName: this.todosTable,
            Key:{
                todoId: todoItem.todoId,
                userId: todoItem.userId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': todoItem.attachmentUrl
            }
        })
        .promise()
    
        // if(result.Count !== 0 ){
        //     return result.Items as TodoItem[]
        // }
    
        // return null
    }
    
    async updateToDo(todoUpdate: TodoUpdate, todoId: string, userId: string) {
        await this.docClient
        .update({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set name = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues:{
                "name": todoUpdate["name"],
                "dueDate" : todoUpdate["dueDate"],
                "done" : todoUpdate["done"]
            },
            // ReturnValues: "ALL_NEW"
        })
        .promise()
    }
    
    
    async createTodo(todoItem: TodoItem) :Promise<TodoItem>{
        await this.docClient
        .put({
            TableName: this.todosTable,
            Item: todoItem
        })
        .promise()
    
        return todoItem
    }
    
    
    async getTodoById(todoId:string) :Promise<TodoItem>{    
    
        const resultSet = await this.docClient
        .query({
            TableName: this.todosTable,
            IndexName: this.indexTable,
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
    
    async deleteToDo(userId: string, todoId: string) {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        }).promise()
    }
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
