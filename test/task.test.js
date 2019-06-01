const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { userOneId, userOne, userTwoId, userTwo, taskOne, taskTwo, taskThree, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
    const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: 'Test my test'
    })
    .expect(201);

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
});

test('Should not create task with invalid description', async () => {
    const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: '',
        completed: true
    })
    .expect(400);

    const task = await Task.findById(response.body._id);
    expect(task).toBeNull();
});

test('Should not create task with invalid completed', async () => {
    const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: 'Test my test1',
        completed: 'completed'
    })
    .expect(400);

    const task = await Task.findById(response.body._id);
    expect(task).toBeNull();
});

test('Should fetch user tasks', async () => {
    const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

    expect(response.body.length).toEqual(2);
});

test('Should fetch only completed user tasks', async () => {
    const response = await request(app)
    .get('/tasks?completed=true')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

    expect(response.body.length).toEqual(1);
});

test('Should fetch only completed user tasks', async () => {
    const response = await request(app)
    .get('/tasks?completed=false')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

    expect(response.body.length).toEqual(1);
});

test('Should sort tasks by creation date in desc order', async () => {
    const response = await request(app)
    .get('/tasks?sortBy=createdAt:desc')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

    expect(response.body[0]._id).toBe(taskTwo._id.toString());
});

test('Should sort tasks by creation date in asc order', async () => {
    const response = await request(app)
    .get('/tasks?sortBy=createdAt:asc')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

    expect(response.body[0]._id).toBe(taskOne._id.toString());
});

test('Should fetch page of tasks', async () => {
    const response = await request(app)
    .get('/tasks?limit=1&skip=1')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0]._id).toBe(taskTwo._id.toString());
});

test('Should not fetch user task if unauthenticated', async () => {
    const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .send()
    .expect(401);
});

test('Should not fetch other users task by id', async () => {
    const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);
});

test('Should not delete other users tasks', async () => {
    const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
});

test('Should delete users task', async () => {
    const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

    const task = await Task.findById(taskOne._id);
    expect(task).toBeNull();
});

test('Should update users task', async () => {
    const response = await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: 'Updated task',
        completed: true
    })
    .expect(200);

    const task = await Task.findById(taskOne._id);
    expect(task.description).toBe('Updated task');
    expect(task.completed).toBe(true);
});

test('Should not update other users task', async () => {
    const response = await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
        description: 'Updated task'
    })
    .expect(404);

    const task = await Task.findById(taskOne._id);
    expect(task.description).not.toBe('Updated task');
});
