import fs from 'fs/promises';

// Чтение данных из access.json
export async function readAccessFile() {
    const data = await fs.readFile('access.json', 'utf-8');
    return JSON.parse(data);
}

// Запись данных в access.json
export async function writeAccessFile(data) {
    await fs.writeFile('access.json', JSON.stringify(data, null, 2));
}

// Проверка, есть ли у пользователя неограниченный доступ
export async function hasUnlimitedAccess(userId) {
    const accessData = await readAccessFile();
    return accessData.unlimited_access_users.includes(userId);
}

// Добавление пользователя в список неограниченного доступа
export async function addUser(userId) {
    const accessData = await readAccessFile();
    if (!accessData.unlimited_access_users.includes(userId)) {
        accessData.unlimited_access_users.push(userId);
        await writeAccessFile(accessData);
    }
}

// Удаление пользователя из списка неограниченного доступа
export async function removeUser(userId) {
    const accessData = await readAccessFile();
    accessData.unlimited_access_users = accessData.unlimited_access_users.filter(id => id !== userId);
    await writeAccessFile(accessData);
}

// Получение списка пользователей с неограниченным доступом
export async function listUsers() {
    const accessData = await readAccessFile();
    return accessData.unlimited_access_users;
}
