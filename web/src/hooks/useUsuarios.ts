import { useState, useEffect } from 'react';
import { getTodosUsuarios, atualizarUsuario, criarUsuario, deletarUsuario, getUsuarioPorId } from '../services/usuariosService';

export function useGetTodosUsuarios() {
  const [usuarios, setUsuarios]: any = useState(null);
  const [loading, setLoading]: any = useState(true);
  const [error, setError]: any = useState();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getTodosUsuarios();
        setUsuarios(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { usuarios, loading, error };
}

export function useGetUsuarioPorId(id: number) {
  const [usuarios, setUsuarios]: any = useState(null);
  const [loading, setLoading]: any = useState(true);
  const [error, setError]: any = useState();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsuarioPorId(id);
        setUsuarios(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { usuarios, loading, error };
}

export function useAtualizarUsuario(id: number, dados: { nome?: string; email?: string }) {
  const [usuarios, setUsuarios]: any = useState(null);
  const [loading, setLoading]: any = useState(true);
  const [error, setError]: any = useState();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await atualizarUsuario(id, dados);
        setUsuarios(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { usuarios, loading, error };
}

export function useCriarUsuario(dados: { nome: string; email: string }) {
  const [usuarios, setUsuarios]: any = useState(null);
  const [loading, setLoading]: any = useState(true);
  const [error, setError]: any = useState();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await criarUsuario(dados);
        setUsuarios(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { usuarios, loading, error };
}

export function useDeletarUsuario(id: number) {
  const [usuarios, setUsuarios]: any = useState(null);
  const [loading, setLoading]: any = useState(true);
  const [error, setError]: any = useState();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await deletarUsuario(id);
        setUsuarios(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { usuarios, loading, error };
}