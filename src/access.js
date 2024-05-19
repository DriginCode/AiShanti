import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Получение текущего каталога файла
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const accessFilePath = path.join(__dirname, '..', 'config', 'access.json');

// Функция для загрузки данных доступа из файла
async function loadAccessData() {
    try {
        const data = await fs.readFile(accessFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {}; // Возвращаем пустой объект, если файл не найден
        } else {
            throw error;
        }
    }
}

// Функция для сохранения данных доступа в файл
async function saveAccessData(data) {
    try {
        await fs.writeFile(accessFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('Error while saving access data', error.message);
    }
}

// Функция для добавления пользователя в список с неограниченным доступом
async function addUser(userId) {
    const accessData = await loadAccessData();
    if (accessData[userId]) {
        accessData[userId].unlimited = true;
        accessData[userId].count = 0; // Обнуляем счетчик для неограниченного доступа
    } else {
        accessData[userId] = { unlimited: true, count: 0 };
    }
    await saveAccessData(accessData);
}

// Функция для удаления пользователя из списка с неограниченным доступом
async function removeUser(userId) {
    const accessData = await loadAccessData();
    delete accessData[userId];
    await saveAccessData(accessData);
}

// Функция для проверки доступа пользователя
async function checkAccess(userId) {
    const accessData = await loadAccessData();
    if (!accessData[userId]) {
        // Добавляем нового пользователя с лимитом в 10 сообщений
        accessData[userId] = { unlimited: false, count: 10 };
        await saveAccessData(accessData);
        return true; // Доступ разрешен для нового пользователя
    }
    if (accessData[userId].unlimited) {
        return true; // Неограниченный доступ
    }
    if (accessData[userId].count > 0) {
        return true; // Доступ разрешен
    }
    return false; // Достигнут лимит на сегодня
}

// Функция для уменьшения счетчика сообщений
async function decrementMessageCount(userId) {
    const accessData = await loadAccessData();
    if (accessData[userId] && !accessData[userId].unlimited) {
        accessData[userId].count -= 1;
        await saveAccessData(accessData);
    }
}

// Экспорт функций
export { checkAccess, addUser, removeUser, decrementMessageCount };
