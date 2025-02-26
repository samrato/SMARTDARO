const{Router}=require("express")
const { registerUser, loginUser, getUser, updateUser }=require("../controllers/userController")


const router=Router()
// =============The registrations and longin API
// ================== ROUTES ==================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:userId", getUser);
router.put("/:userId", updateUser);


module.exports=router;
