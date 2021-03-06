/*global afterEach, beforeEach, describe, it */

const expect = require('expect')
const fs = require('fs')
const jsdom = require('jsdom')
const path = require('path')

const errorMessage = "Should have called `console.log()` with the appropriate string."

describe('shopping', () => {
  before(done => {
    const src = path.resolve(__dirname, '..', 'shopping.js')

    jsdom.env('<div></div>', [src], {
      virtualConsole: jsdom.createVirtualConsole().sendTo(console)
    }, (error, window) => {
      if (error) {
        return done(error);
      }

      Object.keys(window).forEach(key => {
        global[key] = window[key]
      })

      return done()
    })
  })

  beforeEach(() => {
    setCart([])

    expect.spyOn(console, 'log')
  })

  afterEach(() => {
    expect.restoreSpies()
  })

  describe('#addToCart', () => {
    it("should add an item to the cart", () => {
      addToCart('pizza')

      expect(getCart().length).toEqual(1);
    });

    it("logs that the item has been added", () => {
      addToCart('pizza')

      expect(console.log).toHaveBeenCalledWith("pizza has been added to your cart.")
    })

    it("returns the cart", () => {
      expect(addToCart("pizza")).toEqual(getCart())
    })
  });

  describe('#viewCart', () => {
    it("should print each item in the cart and their cost", () => {
      addToCart("socks");
      addToCart("puppy");
      addToCart("iPhone");

      const socksCost = getCart()[0]["socks"];
      const puppyCost = getCart()[1]["puppy"];
      const iPhoneCost = getCart()[2]["iPhone"];

      viewCart();

      expect(console.log).toHaveBeenCalledWith(
        `In your cart, you have socks at $${socksCost}, puppy at $${puppyCost}, iPhone at $${iPhoneCost}.`
      )
    });

    it("should print 'Your shopping cart is empty.' if the cart is empty", () => {
      viewCart();

      expect(console.log).toHaveBeenCalledWith("Your shopping cart is empty.")
    });
  });

  describe('#total', () => {
    it('adds up the prices of the items in the cart', () => {
      addToCart("socks");
      addToCart("puppy");
      addToCart("iPhone");

      const socksCost = getCart()[0]["socks"];
      const puppyCost = getCart()[1]["puppy"];
      const iPhoneCost = getCart()[2]["iPhone"];

      const totalCost = socksCost + puppyCost + iPhoneCost;

      expect(total()).toEqual(totalCost)
    })
  })

  describe('#removeFromCart', () => {
    it("removes the item from the cart", () => {
      addToCart('pizza')

      expect(hasItem(getCart(), 'pizza')).toBe(true)

      removeFromCart("pizza");

      expect(getCart()).toEqual([]);
    });

    it("alerts you if you're trying to remove an item that isn't in your cart", () => {
      removeFromCart("sock")

      expect(console.log).toHaveBeenCalledWith("That item is not in your cart.")
    });
  });

  describe('#placeOrder', () => {
    it("doesn't let you place an order if you don't provide a credit card number", () => {
      placeOrder();

      expect(console.log).toHaveBeenCalledWith(
        "We don't have a credit card on file for you to place your order."
      )
    });

    it("lets you place an order with a credit card", () => {
      addToCart('pizza')

      const t = total()

      placeOrder(123);

      expect(console.log).toHaveBeenCalledWith(
        `Your total cost is $${t}, which will be charged to the card 123.`
      )
    });

    it('empties the cart', () => {
      addToCart('pizza')

      expect(hasItem(getCart(), 'pizza')).toBe(true)

      placeOrder(123);

      expect(getCart()).toEqual([])
    })
  })
})

function hasItem(c, item) {
  for (let i = 0, l = c.length; i < l; i++) {
    if (c[i].hasOwnProperty(item)) {
      return true
    }
  }

  return false
}
