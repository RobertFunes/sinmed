// Header.jsx
import { FaUserPlus, FaComments, FaUser, FaPlusCircle, FaSearch, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { NavBar, NavButton,LogoLink } from './Header.styles.jsx';
const Header = () => {
  return (
    <header>
      <NavBar>
        <LogoLink to="/">
          <img src="/logo-delvalle.png" alt="del valle conecta" />

        </LogoLink>
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
