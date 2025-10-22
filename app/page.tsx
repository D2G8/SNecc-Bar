"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { User, X, ShoppingCart, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  getCurrentUser,
  logout,
  updateUserBalance,
  addTransaction,
  initializeAuth,
  type User as UserType,
} from "@/lib/auth"

const products = [
  {
    id: "A1",
    name: "Twix",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ekKeV9LUJF20fmKr2Lerdoo002yXPM.png",
    price: 0.7,
  },
  {
    id: "A2",
    name: "M&Ms",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SuD8LLoNWlLXHkeyLzbZ6QRwWxlPhQ.png",
    price: 0.7,
  },
  {
    id: "A3",
    name: "Maltesers",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-RAHNVSRsIjgD9Tb1K1qTiy5AgUAcUq.png",
    price: 0.7,
  },
  {
    id: "A4",
    name: "Napolitanas",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SIIxVdNrpGWkis71cZq6FgdQDdsTEE.png",
    price: 0.3,
  },
  {
    id: "A5",
    name: "Monster Energy",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LRmHB3X62ljtxxExl9qV9yOfSRnI84.png",
    price: 1.5,
  },
  { id: "A6", name: "Coffee", image: "/coffee-cup.jpg", price: 0.3 },
  {
    id: "A7",
    name: "Water",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-h0FCjCZA2Lvku1f6RTJVNkcfhZlWi0.png",
    price: 0.2,
  },
  {
    id: "A8",
    name: "Coca Cola",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-X86Wh0mb2uWux4vCSUrOEZ669osUbI.png",
    price: 0.8,
  },
  { id: "A9", name: "Coke Zero", image: "/coke-zero-can.jpg", price: 0.8 },
]

type CartItem = {
  product: (typeof products)[0]
  quantity: number
}

type AnimatingProduct = {
  id: string
  image: string
  startX: number
  startY: number
  endX: number
  endY: number
}

export default function VendingMachine() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isCheckoutPageOpen, setIsCheckoutPageOpen] = useState(false)
  const [isForSomeoneElse, setIsForSomeoneElse] = useState(false)
  const [isNeccMember, setIsNeccMember] = useState(false)
  const [animatingProducts, setAnimatingProducts] = useState<AnimatingProduct[]>([])
  const cartButtonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  useEffect(() => {
    initializeAuth()
    const checkUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    }
    checkUser()
  }, [])

  const handleLogin = () => {
    setIsPopupOpen(false)
    router.push("/login")
  }

  const handleRegister = () => {
    setIsPopupOpen(false)
    router.push("/register")
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    setCart([])
    setIsPopupOpen(false)
  }

  const handleProductClick = (product: (typeof products)[0], event: React.MouseEvent<HTMLButtonElement>) => {
    if (!currentUser) {
      alert("Por favor, faça login para adicionar produtos ao carrinho")
      return
    }

    const productElement = event.currentTarget
    const productRect = productElement.getBoundingClientRect()
    const cartButton = cartButtonRef.current

    if (cartButton) {
      const cartRect = cartButton.getBoundingClientRect()

      const animatingProduct: AnimatingProduct = {
        id: `${product.id}-${Date.now()}`,
        image: product.image,
        startX: productRect.left + productRect.width / 2,
        startY: productRect.top + productRect.height / 2,
        endX: cartRect.left + cartRect.width / 2,
        endY: cartRect.top + cartRect.height / 2,
      }

      setAnimatingProducts((prev) => [...prev, animatingProduct])

      setTimeout(() => {
        setAnimatingProducts((prev) => prev.filter((p) => p.id !== animatingProduct.id))

        const existingItem = cart.find((item) => item.product.id === product.id)
        if (existingItem) {
          setCart(
            cart.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
          )
        } else {
          setCart([...cart, { product, quantity: 1 }])
        }
      }, 600)
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const handleCheckout = () => {
    setIsCheckoutOpen(false)
    setIsCheckoutPageOpen(true)
  }

  const completePurchase = async () => {
    if (!currentUser) {
      alert("Por favor, faça login para completar a compra")
      return
    }

    const total = getCartTotal()

    if (currentUser.balance >= total) {
      const newBalance = currentUser.balance - total
      await updateUserBalance(currentUser.id, newBalance)

      await addTransaction({
        userId: currentUser.id,
        items: cart.map((item) => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total,
        isForSomeoneElse,
        isNeccMember,
      })

      setCurrentUser({ ...currentUser, balance: newBalance })

      alert(
        `Compra realizada com sucesso! ${cart.length} item(s) dispensado(s). Saldo restante: €${newBalance.toFixed(2)}`,
      )
      setCart([])
      setIsCheckoutPageOpen(false)
      setIsForSomeoneElse(false)
      setIsNeccMember(false)
    } else {
      alert(`Saldo insuficiente! Total é €${total.toFixed(2)}, mas você tem apenas €${currentUser.balance.toFixed(2)}`)
    }
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <div className="min-h-screen bg-neutral-200 p-8 flex items-center justify-center relative">
      <Card className="bg-cyan-500 p-8 rounded-3xl shadow-2xl max-w-2xl">
        <div className="bg-neutral-900 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <h1 className="text-cyan-400 text-xl font-semibold">Bem vindo ao SNecc-Bar</h1>
          <div className="bg-white rounded-lg p-2">
            <span className="text-cyan-500 font-bold text-sm">N</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8">
          <div className="grid grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col items-center">
                <button
                  onClick={(e) => handleProductClick(product, e)}
                  className="border-4 border-neutral-300 rounded-xl p-4 bg-white w-32 h-32 flex items-center justify-center mb-2 hover:border-cyan-400 hover:shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </button>
                <span className="text-sm text-cyan-600 font-medium">€{product.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-4 mt-6 flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPopupOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-neutral-800"
          >
            <User className="w-6 h-6" />
          </Button>
          <Button
            ref={cartButtonRef}
            variant="ghost"
            size="icon"
            onClick={() => setIsCheckoutOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-neutral-800 relative"
          >
            <ShoppingCart className="w-6 h-6" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {getTotalItems()}
              </span>
            )}
          </Button>
        </div>
      </Card>

      {animatingProducts.map((animProduct) => (
        <div
          key={animProduct.id}
          className="fixed pointer-events-none z-[100]"
          style={
            {
              left: `${animProduct.startX}px`,
              top: `${animProduct.startY}px`,
              animation: `dropToCart 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
              "--end-x": `${animProduct.endX - animProduct.startX}px`,
              "--end-y": `${animProduct.endY - animProduct.startY}px`,
            } as React.CSSProperties
          }
        >
          <img src={animProduct.image || "/logonecc.png"} alt="Product" className="w-16 h-16 object-contain" />
        </div>
      ))}

      {isPopupOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsPopupOpen(false)} />

          <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-3xl shadow-2xl w-96 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700"
            >
              <X className="w-5 h-5" />
            </Button>

            <h2 className="text-cyan-500 text-3xl font-bold text-center mb-6">Área do aluno</h2>

            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-500 rounded-full p-3">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-semibold text-neutral-800 text-lg">{currentUser?.name || "Guest"}</p>
                <p className="text-cyan-500 font-medium">
  Balance: €{currentUser?.balance !== undefined ? currentUser.balance.toFixed(2) : "0.00"}
</p>

              </div>
            </div>

            {currentUser ? (
              <div className="space-y-3">
                {currentUser.role === "admin" && (
                  <Button
                    onClick={() => {
                      setIsPopupOpen(false)
                      router.push("/admin")
                    }}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Admin Panel
                  </Button>
                )}
                <Button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-3 mb-6">
                <Button onClick={handleLogin} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white">
                  Login
                </Button>
                <Button onClick={handleRegister} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white">
                  Register
                </Button>
              </div>
            )}

            <div className="border-2 border-cyan-400 rounded-xl p-6 text-center bg-cyan-50 mt-6">
              <p className="text-cyan-600 font-medium">
                {currentUser ? "Clique nos produtos para adicionar ao carrinho" : "Faça login para começar a comprar"}
              </p>
            </div>
          </Card>
        </>
      )}

      {isCheckoutOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsCheckoutOpen(false)} />

          <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-3xl shadow-2xl w-[500px] max-h-[80vh] overflow-y-auto z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700"
            >
              <X className="w-5 h-5" />
            </Button>

            <h2 className="text-cyan-500 text-3xl font-bold text-center mb-6">Checkout</h2>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500 text-lg">Your cart is empty</p>
                <p className="text-neutral-400 text-sm mt-2">Add some products to get started</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-4 p-4 border-2 border-neutral-200 rounded-xl"
                    >
                      <img
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-16 h-16 object-contain"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-800">{item.product.name}</p>
                        <p className="text-sm text-neutral-500">€{item.product.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-neutral-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-neutral-800">Total:</span>
                    <span className="text-2xl font-bold text-cyan-500">€{getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-neutral-600">Your Balance:</span>
                    <span className="font-semibold text-neutral-800">€{currentUser?.balance.toFixed(2) || "0.00"}</span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-lg py-6"
                    disabled={!currentUser || currentUser.balance < getCartTotal()}
                  >
                    {!currentUser
                      ? "Login Necessário"
                      : currentUser.balance < getCartTotal()
                        ? "Saldo Insuficiente"
                        : "Complete Purchase"}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </>
      )}

      {isCheckoutPageOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsCheckoutPageOpen(false)} />

          <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-3xl shadow-2xl w-[500px] z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCheckoutPageOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700"
            >
              <X className="w-5 h-5" />
            </Button>

            <h2 className="text-cyan-500 text-3xl font-bold text-center mb-8">Finalizar Compra</h2>

            <div className="mb-6 p-4 bg-neutral-50 rounded-xl">
              <h3 className="font-semibold text-neutral-800 mb-3">Resumo do Pedido</h3>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-neutral-600">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="font-medium text-neutral-800">
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-200 mt-3 pt-3 flex justify-between">
                <span className="font-semibold text-neutral-800">Total:</span>
                <span className="text-xl font-bold text-cyan-500">€{getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 p-4 border-2 border-neutral-200 rounded-xl hover:border-cyan-400 transition-colors">
                <Checkbox
                  id="forSomeoneElse"
                  checked={isForSomeoneElse}
                  onCheckedChange={(checked) => setIsForSomeoneElse(checked as boolean)}
                  className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                />
                <label htmlFor="forSomeoneElse" className="text-neutral-800 font-medium cursor-pointer flex-1">
                  É para outra pessoa
                </label>
              </div>

              <div className="flex items-center space-x-3 p-4 border-2 border-neutral-200 rounded-xl hover:border-cyan-400 transition-colors">
                <Checkbox
                  id="neccMember"
                  checked={isNeccMember}
                  onCheckedChange={(checked) => setIsNeccMember(checked as boolean)}
                  className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                />
                <label htmlFor="neccMember" className="text-neutral-800 font-medium cursor-pointer flex-1">
                  Sócio do Necc
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 text-sm p-4 bg-cyan-50 rounded-xl">
              <span className="text-neutral-600">Saldo Disponível:</span>
              <span className="font-semibold text-neutral-800">€{currentUser?.balance.toFixed(2) || "0.00"}</span>
            </div>

            <Button
              onClick={completePurchase}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-lg py-6"
              disabled={!currentUser || currentUser.balance < getCartTotal()}
            >
              {!currentUser
                ? "Login Necessário"
                : currentUser.balance < getCartTotal()
                  ? "Saldo Insuficiente"
                  : "Confirmar Compra"}
            </Button>
          </Card>
        </>
      )}
    </div>
  )
}
