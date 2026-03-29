import { ProductsManagement } from '../../components'
import styles from './product.module.css'

export function ProductManager() {
  return (
    <div className={styles.productManager}>
      <ProductsManagement />
    </div>
  )
}
