import React, { useEffect, useState } from 'react';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link, useLoaderData } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([])
    const [currentPage, setcurrentPage ] = useState(0)
    const [ItemPerPages, setItemPerPages] = useState(10)
    const {totalProducts} = useLoaderData();
    const itemOption = [5,10,15,20]

    const totalPages = Math.ceil(totalProducts/ItemPerPages);

    // const pageNumbers = [];
    // for (let i = 1; i <= totalPages; i++) {
    //     pageNumbers.push(i);
    // }

    const pageNumbers = [...Array(totalPages).keys()]
     /**
     * Done: 1. Determine the total number of items: 
     * TODO: 2. Decide on the number of items per page: 
     * DONE: 3. Calculate the total number of pages: 
     * DONE: 4. Determine the current page:
     * 
    **/

    useEffect(() => {
        fetch(`http://localhost:5000/products?page=${currentPage}&limit=${ItemPerPages}`)
            .then(res => res.json())
            .then(data => setProducts(data))
    }, [currentPage,ItemPerPages]);
    

    useEffect(() => {
        const storedCart = getShoppingCart();
        const ids = Object.keys(storedCart);
        console.log(ids)
        fetch('http://localhost:5000/productByIds', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(ids)
        })
        .then(res=> res.json())
        .then(products=> {
            const savedCart = [];
            // step 1: get id of the addedProduct
            for (const id in storedCart) {
                // step 2: get product from products state by using id
                const addedProduct = products.find(product => product._id === id)
                if (addedProduct) {
                    // step 3: add quantity
                    const quantity = storedCart[id];
                    addedProduct.quantity = quantity;
                    // step 4: add the added product to the saved cart
                    savedCart.push(addedProduct);
                }
                // console.log('added Product', addedProduct)
            }
            // step 5: set the cart
            setCart(savedCart);
        })
        
    }, [])


    const handleSelectChange =(e)=>{
        setItemPerPages(parseInt(e.target.value))
        setcurrentPage(0);
    }


    const handleAddToCart = (product) => {
        // cart.push(product); '
        let newCart = [];
        // const newCart = [...cart, product];
        // if product doesn't exist in the cart, then set quantity = 1
        // if exist update quantity by 1
        const exists = cart.find(pd => pd._id === product._id);
        if (!exists) {
            product.quantity = 1;
            newCart = [...cart, product]
        }
        else {
            exists.quantity = exists.quantity + 1;
            const remaining = cart.filter(pd => pd._id !== product._id);
            newCart = [...remaining, exists];
        }

        setCart(newCart);
        addToDb(product._id)
    }

    const handleClearCart = () => {
        setCart([]);
        deleteShoppingCart();
    }

    return (
        <div className='shop-container'>
            <div className="products-container">
                {
                    products.map(product => <Product
                        key={product._id}
                        product={product}
                        handleAddToCart={handleAddToCart}
                    ></Product>)
                }
            </div>
            <div className="cart-container">
                <Cart
                    cart={cart}
                    handleClearCart={handleClearCart}
                >
                    <Link className='proceed-link' to="/orders">
                        <button className='btn-proceed'>Review Order</button>
                    </Link>
                </Cart>
            </div>

            {/* {Pagination} */}

            <div className="pagination">
                <p>Current Page: {currentPage} and Item Per Page: {ItemPerPages}</p>
                {
                    pageNumbers.map(number=> <button
                        key={number}
                        className={currentPage === number ? 'selected' :''}
                        onClick={()=>setcurrentPage(number)}
                        > {number}</button>)
                }
                <select value={ItemPerPages} onChange={handleSelectChange}>
                    {
                        itemOption.map(option=>{
                          return  <option key={option} value={option}>{option}</option>
                        })
                    }
                </select>
            </div>
        </div>
    );
};

export default Shop;