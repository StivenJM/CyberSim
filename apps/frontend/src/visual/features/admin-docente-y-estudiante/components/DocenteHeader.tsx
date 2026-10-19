import styles from '../styles/DocenteHeader.module.css'
import UserMenu from './UserMenu'

export default function DocenteHeader() {
	return (
		<header className={styles.topBar}>
			<img
				src="/assets/pictures/computer_logo.webp"
				alt="Logo"
				width={32}
				height={32}
			/>
			<UserMenu />
		</header>
	)
}
