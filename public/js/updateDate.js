import axios from 'axios';
import { showmsg } from './alerts';

export const updateSitting = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    showmsg('success', `${type} successfully updated`);
  } catch (err) {
    showmsg('error', err.response.data.message);
  }
};
