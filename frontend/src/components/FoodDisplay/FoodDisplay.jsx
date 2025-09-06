import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({ category }) => {

     const { food_list } = useContext(StoreContext)
        // {
        //     _id: "13",
        //     name: "Chicken Sandwich",
        //     image: food_13,
        //     price: 12,
        //     description: "Food provides essential nutrients for overall health and well-being",
        //     category: "Sandwich"
        // }
    return (
        <div className='food-display' id='food-display'>
            <h2>Top dishes near you</h2>
            <div className="food-display-list">
                {food_list.map((item, index) => {
                    if (category === "All" || category === item.category) {
                        return <FoodItem key={index} id={item._id} name={item.name} description={item.description} price={item.price} image={item.image} />

                    }


                    

                })}
            </div>

        </div>
    )
}

export default FoodDisplay