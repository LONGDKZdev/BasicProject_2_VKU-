/**
 * Custom Hook: useCRUD
 * Reusable CRUD operations for any Supabase table
 * Handles: Fetch, Create, Update, Delete with loading/error states
 */

import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { notifySuccess, notifyError } from '../utils/notifications';

export const useCRUD = (tableName, selectQuery = '*') => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // FETCH
  const fetchData = useCallback(async (filters = {}, orderBy = null) => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase.from(tableName).select(selectQuery);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
      }

      const { data: result, error: err } = await query;

      if (err) throw err;
      console.log(`✅ Fetched ${tableName}:`, result);
      setData(result || []);
      return result || [];
    } catch (err) {
      console.error(`❌ Error fetching ${tableName}:`, err);
      setError(err.message);
      notifyError(`Error fetching ${tableName}: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [tableName, selectQuery]);

  // CREATE
  const create = useCallback(async (values, successMessage = 'Created successfully') => {
    try {
      setIsLoading(true);
      const { data: result, error: err } = await supabase
        .from(tableName)
        .insert([values])
        .select();

      if (err) throw err;
      console.log(`✅ Created in ${tableName}:`, result);
      notifySuccess(successMessage);
      await fetchData();
      return result?.[0];
    } catch (err) {
      console.error(`❌ Error creating in ${tableName}:`, err);
      notifyError(`Error creating: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tableName, fetchData]);

  // UPDATE
  const update = useCallback(async (id, values, successMessage = 'Updated successfully') => {
    try {
      setIsLoading(true);
      const { data: result, error: err } = await supabase
        .from(tableName)
        .update(values)
        .eq('id', id)
        .select();

      if (err) throw err;
      console.log(`✅ Updated in ${tableName}:`, result);
      notifySuccess(successMessage);
      await fetchData();
      return result?.[0];
    } catch (err) {
      console.error(`❌ Error updating in ${tableName}:`, err);
      notifyError(`Error updating: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tableName, fetchData]);

  // DELETE
  const remove = useCallback(async (id, successMessage = 'Deleted successfully') => {
    try {
      setIsLoading(true);
      const { error: err } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (err) throw err;
      console.log(`✅ Deleted from ${tableName}`);
      notifySuccess(successMessage);
      await fetchData();
    } catch (err) {
      console.error(`❌ Error deleting from ${tableName}:`, err);
      notifyError(`Error deleting: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tableName, fetchData]);

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
