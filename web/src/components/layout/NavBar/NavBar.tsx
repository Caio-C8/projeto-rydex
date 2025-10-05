import "./NavBar.css";

interface NavBarProps {
  activeTab: string;
  setActiveTab: Function;
}

const NavBar = ({ activeTab, setActiveTab }: NavBarProps) => {
  return (
    <header className="header">
      <nav className="nav">
        <button
          onClick={() => setActiveTab("todos")}
          className={activeTab === "todos" ? "active" : ""}
        >
          Todos
        </button>
        <button
          onClick={() => setActiveTab("buscar")}
          className={activeTab === "buscar" ? "active" : ""}
        >
          Buscar
        </button>
        <button
          onClick={() => setActiveTab("criar")}
          className={activeTab === "criar" ? "active" : ""}
        >
          Criar
        </button>
        <button
          onClick={() => setActiveTab("atualizar")}
          className={activeTab === "atualizar" ? "active" : ""}
        >
          Atualizar
        </button>
        <button
          onClick={() => setActiveTab("deletar")}
          className={activeTab === "deletar" ? "active" : ""}
        >
          Deletar
        </button>
      </nav>
    </header>
  );
};

export default NavBar;
