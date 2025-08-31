// Header.jsx
import { useEffect, useState } from 'react';
import { FaUserPlus, FaComments, FaUser , FaLink, FaPlusCircle, FaSearch  } from 'react-icons/fa';
import { RiContractFill } from "react-icons/ri";
import { Link } from 'react-router-dom';
import { NavBar, NavButton,LogoLink } from './Header.styles.jsx';
import { url } from '../helpers/url.js';
import { LiaFileContractSolid } from "react-icons/lia";
// Header.jsx

const Header = () => {
  const [isConnected, setIsConnected] = useState(null); // null = sin saber todavía 🤔
  useEffect(() => {
    const getStatus = async () => {
      try {
        const res = await fetch(`${url}/whats/status`, {
          method: 'GET',
          credentials: 'include' // o 'same-origin' si es mismo dominio
        });

        const data = await res.json();
        setIsConnected(data?.isAuth === true); // true ✅  | false ❌
      } catch (err) {
        console.error('Error consultando estado de WhatsApp:', err);
        setIsConnected(false); // asumimos desconectado si algo falla 🚨
      }
    };

    getStatus();          // primer chequeo
    const interval = setInterval(getStatus, 60_000); // refresco cada 60 s 🔄

    return () => clearInterval(interval); // limpiar al desmontar
  }, []);
  // clase dinámica según el estado
  const linkStatusClass =
    isConnected === null
      ? ''                      // aún cargando
      : isConnected
      ? 'connected'            // verde 🍀
      : 'disconnected';        // rojo 🛑

  return (
    <header>
      <NavBar>
        <LogoLink to="/">
          <img src="/logo-delvalle.png" alt="del valle conecta" />

        </LogoLink>
        <NavButton as={Link} to="/add">
          <FaUserPlus fontSize={"1.5rem"}/> 
          <FaPlusCircle />
        </NavButton>
        <NavButton as={Link} to="/addContract">
          <LiaFileContractSolid fontSize={"1.5rem"}/>
          <FaPlusCircle />
        </NavButton>
        <NavButton as={Link} to="/pending" className="agenda">
          <FaComments /> Pendientes
        </NavButton>

        <NavButton as={Link} to="/" className="agenda">
          <FaUser  /> Perfiles
        </NavButton>
        <NavButton as={Link} to="/contracts" className="agenda">
          <RiContractFill /> Pólizas
        </NavButton>
        <NavButton as={Link} to="/search" className="agenda">
          <FaSearch style={{ fontSize: '1.5rem' }} />
        </NavButton>
        <NavButton
          as={Link}
          to="/link"
          className={`whatsapp-status ${linkStatusClass}`}
        >
          <FaLink /> Link
        </NavButton>
        
      </NavBar>
    </header>
  );
};

export default Header;
