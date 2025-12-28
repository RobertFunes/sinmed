// Header.jsx
import { FaUserPlus, FaComments, FaUser, FaSearch, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { NavBar, NavButton } from './Header.styles.jsx';
const Header = () => {
  return (
    <header>
      <NavBar>
        <NavButton as={Link} to="/add">
          <FaUserPlus fontSize={"1.5rem"}/> Agregar
        </NavButton>
        <NavButton as={Link} to="/pending" className="agenda">
          <FaComments /> Pendientes
        </NavButton>

        <NavButton as={Link} to="/" className="agenda">
          <FaUser  /> Perfiles
        </NavButton>
        <NavButton as={Link} to="/calendar" className="agenda">
          <FaCalendarAlt /> Calendario
        </NavButton>
        <NavButton as={Link} to="/search" className="agenda">
          <FaSearch style={{ fontSize: '1.5rem' }} /> Buscar
        </NavButton>
      </NavBar>
    </header>
  );
};

export default Header;
