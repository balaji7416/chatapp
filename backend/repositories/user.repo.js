import pool from "../config/db.js";

//find user
const findUserByEmail = async (email) => {
  const query = `select * from users where email = $1 and deleted_at is null`;
  const { rows } = await pool.query(query, [email]);
  return rows[0];
};

const findUserById = async (id) => {
  const query = `
        select * from users where id = $1 and deleted_at is null
    `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const findUserByToken = async (token) => {
  const query = `
        select * from users where refresh_token = $1 and deleted_at is null
    `;
  const { rows } = await pool.query(query, [token]);
  return rows[0];
};

//create a user
const createUser = async ({ username, email, password_hash }) => {
  const query = `insert into users (username, email, password_hash)
                   values ($1, $2, $3)
                   returning id, email, username, created_at
                   `;
  const { rows } = await pool.query(query, [username, email, password_hash]);
  return rows[0];
};

//store/update refres token in db
const updateRefreshToken = async (id, refresh_token) => {
  const query = `
        update users
        set refresh_token = $1
        where id = $2 and deleted_at is null
        returning id
    `;
  const { rows } = await pool.query(query, [refresh_token, id]);
  return rows[0];
};

export {
  findUserByEmail,
  findUserById,
  findUserByToken,
  createUser,
  updateRefreshToken,
};
