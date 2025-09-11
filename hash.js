import bcrypt from "bcryptjs";

const generarHash = async () => {
  const password = "Colombia2026"
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  console.log("Hash generado:", hash);
};

generarHash();
