import { create } from '../../../lib/index.js';

export default function () {
  const root = create().ele('root');

  for (let i = 0; i < 100; i++) {
    const category = root.ele('category', { id: i.toString(), name: `Category ${i}` });
    
    for (let j = 0; j < 10; j++) {
      const subcategory = category.ele('subcategory', { id: `${i}-${j}`, name: `Subcategory ${i}-${j}` });
      
      for (let k = 0; k < 10; k++) {
        subcategory.ele('product', { 
          id: `${i}-${j}-${k}`,
          sku: `SKU-${i}-${j}-${k}`,
          price: (Math.random() * 1000).toFixed(2)
        })
          .ele('name', {}, `Product ${k}`)
          .up()
          .ele('description', {}, `Description for product ${k} in subcategory ${j} of category ${i}`)
          .up()
          .ele('attributes')
            .ele('weight', {}, (Math.random() * 10).toFixed(2))
            .up()
            .ele('color', {}, ['red', 'blue', 'green', 'yellow', 'black'][Math.floor(Math.random() * 5)])
            .up()
            .ele('available', {}, Math.random() > 0.5 ? 'true' : 'false');
      }
    }
  }

  return root.end({ pretty: true });
}
