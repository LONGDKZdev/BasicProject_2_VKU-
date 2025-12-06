/**
 * Custom Hook: useCRUD
 * Reusable CRUD operations for any Supabase table
 * Handles: Fetch, Create, Update, Delete with loading/error states
 */

import { useState, useCallback, useMemo } from 'react';
import { notifySuccess, notifyError } from '../utils/notifications';
import { supabase } from '../utils/supabaseClient';

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
 * Supports two usage patterns:
 * 1. useCRUD({ resourceName, fetch, create, update, remove }) - With service API object
 * 2. useCRUD(tableName, selectString) - Direct Supabase table access (legacy compatibility)
 *
 * @param {CRUDServiceAPI|string} apiOrTableName - Either an API object or table name string
 * @param {string} [selectString] - Select string for Supabase query (when using table name)
 */
export const useCRUD = (apiOrTableName, selectString = '*') => {
  // Legacy mode: if first param is a string, create Supabase service automatically
  if (typeof apiOrTableName === 'string') {
    const tableName = apiOrTableName;
    
    const resourceName = tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Wrap API functions in useMemo to prevent recreation on every render
    const apiFunctions = useMemo(() => {
      const fetchApi = async (filters = {}, orderBy = null) => {
        let query = supabase.from(tableName).select(selectString);
        
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            query = query.eq(key, value);
          }
        });
        
        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy.column || 'created_at', { ascending: orderBy.ascending !== false });
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      };
      
      const createApi = async (values) => {
        const { data, error } = await supabase.from(tableName).insert([values]).select(selectString);
        if (error) throw error;
        return data?.[0] || null;
      };
      
      const updateApi = async (id, values) => {
        const { data, error } = await supabase.from(tableName).update(values).eq('id', id).select(selectString);
        if (error) throw error;
        return data?.[0] || null;
      };
      
      const removeApi = async (id) => {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) throw error;
      };
      
      return { fetchApi, createApi, updateApi, removeApi };
    }, [tableName, selectString]); // Only recreate if tableName or selectString changes
    
    return useCRUDInternal({ 
      resourceName, 
      fetch: apiFunctions.fetchApi, 
      create: apiFunctions.createApi, 
      update: apiFunctions.updateApi, 
      remove: apiFunctions.removeApi 
    });
  }
  
  // Modern mode: use provided API object
  return useCRUDInternal(apiOrTableName);
};

const useCRUDInternal = ({ resourceName, fetch: fetchApi, create: createApi, update: updateApi, remove: removeApi }) => {
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

      console.log(`✔ Fetched ${name}:`, result);
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
  }, [name, fetchApi]); // Removed setData from dependencies (it's stable)

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
