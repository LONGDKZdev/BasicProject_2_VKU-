/**
 * Custom Hook: useCRUD
 * Reusable CRUD operations for any Supabase table
 * Handles: Fetch, Create, Update, Delete with loading/error states
 */

import { useState, useCallback } from 'react';
import { notifySuccess, notifyError } from '../utils/notifications';
// supabase client import removed as it is now encapsulated in services

/**
 * Defines the required structure for the service layer API used by this hook.
 *
 * @typedef {object} CRUDServiceAPI
 * @property {string} resourceName - Name of the resource (e.g., 'Room Types') for logging and notifications.
 * @property {(filters?: object, orderBy?: { column: string, ascending?: boolean }) => Promise<Array<any>>} fetch - Function to fetch data.
 * @property {(values: object, options?: object) => Promise<any>} create - Function to create a new record.
 * @property {(id: number, values: object, options?: object) => Promise<any>} update - Function to update an existing record.
 * @property {(id: number, options?: object) => Promise<any>} remove - Function to delete a record.
 */

/**
 * Custom Hook: useCRUD
 * Reusable CRUD operations, decoupled from direct Supabase calls via a Service Layer API.
 * Handles: Fetch, Create, Update, Delete with loading/error states
 *
 * @param {CRUDServiceAPI} api - An object containing service functions (fetch, create, update, remove) and resourceName.
 */
export const useCRUD = ({ resourceName, fetch: fetchApi, create: createApi, update: updateApi, remove: removeApi }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Ensure the resource name is available for logging
  const name = resourceName || 'Resource';

  // FETCH
  const fetchData = useCallback(async (filters = {}, orderBy = null) => {
    if (!fetchApi) {
        console.error(`❌ ${name} does not support fetching.`);
        return [];
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // The service layer function handles the actual DB querying, filtering, and ordering
      const result = await fetchApi(filters, orderBy);

      console.log(`✅ Fetched ${name}:`, result);
      setData(result || []);
      return result || [];
    } catch (err) {
      console.error(`❌ Error fetching ${name}:`, err);
      setError(err.message);
      notifyError(`Error fetching ${name}: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [name, fetchApi, setData]);

  // CREATE
  const create = useCallback(async (values, successMessage = `Created ${name} successfully`) => {
    if (!createApi) {
        console.error(`❌ ${name} does not support creation.`);
        throw new Error('Creation not supported');
    }

    try {
      setIsLoading(true);
      
      const result = await createApi(values);
      
      console.log(`✅ Created ${name}:`, result);
      notifySuccess(successMessage);
      await fetchData(); // Refresh data after creation
      return result;
    } catch (err) {
      console.error(`❌ Error creating ${name}:`, err);
      notifyError(`Error creating ${name}: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [name, createApi, fetchData]);

  // UPDATE
  const update = useCallback(async (id, values, successMessage = `Updated ${name} successfully`) => {
    if (!updateApi) {
        console.error(`❌ ${name} does not support updating.`);
        throw new Error('Updating not supported');
    }

    try {
      setIsLoading(true);
      
      const result = await updateApi(id, values);

      console.log(`✅ Updated ${name}:`, result);
      notifySuccess(successMessage);
      await fetchData(); // Refresh data after update
      return result;
    } catch (err) {
      console.error(`❌ Error updating ${name}:`, err);
      notifyError(`Error updating ${name}: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [name, updateApi, fetchData]);

  // DELETE
  const remove = useCallback(async (id, successMessage = `Deleted ${name} successfully`) => {
    if (!removeApi) {
        console.error(`❌ ${name} does not support deletion.`);
        throw new Error('Deletion not supported');
    }

    try {
      setIsLoading(true);
      
      await removeApi(id);

      console.log(`✅ Deleted ${name}`);
      notifySuccess(successMessage);
      await fetchData(); // Refresh data after deletion
    } catch (err) {
      console.error(`❌ Error deleting ${name}:`, err);
      notifyError(`Error deleting ${name}: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [name, removeApi, fetchData]);

  return {
    data,
    setData,
    isLoading,
    error,
    fetchData,
    create,
    update,
    remove
  };
};
