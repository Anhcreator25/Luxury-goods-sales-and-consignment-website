import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as authServices from "../services/authServices.js";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "user"
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setLoading(true);

        try {
            await authServices.registerApi(formData);
            setSuccessMessage("Tạo tài khoản thành công! Đang chuyển hướng sang Đăng nhập...");
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            setError(err.message || "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between selection:bg-[#111111] selection:text-white">
            {/* Top Brand Bar */}
            <header className="w-full px-8 py-6 border-b border-[#EAEAE8] bg-white flex justify-between items-center">
                <Link to="/" className="text-xl tracking-[0.25em] font-serif font-bold text-[#111111] uppercase">
                    Aura Vault
                </Link>
                <span className="text-xs tracking-widest text-[#777777] uppercase font-sans">
                    Authentication Portal
                </span>
            </header>

            {/* Main Container */}
            <main className="flex-grow flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-[480px] bg-white border border-[#E5E5E3] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-10 sm:p-12">
                    {/* Header */}
                    <div className="mb-8 text-left">
                        <div className="inline-block px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase font-semibold bg-[#F4F4F2] text-[#444444] mb-3 border border-[#E0E0DE]">
                            Membership Registration
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif text-[#111111] tracking-wide font-normal">
                            Tạo tài khoản
                        </h1>
                        <p className="text-xs text-[#777777] mt-1.5 leading-relaxed">
                            Trở thành thành viên để duyệt và ký gửi các bộ sưu tập cao cấp.
                        </p>
                    </div>

                    {/* Success Notification Banner */}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-[#F2F8F4] border-l-2 border-[#1E7E34] text-[#155724] text-xs leading-relaxed flex items-center space-x-2">
                            <span>✓</span>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Error Notification */}
                    {error && (
                        <div className="mb-6 p-4 bg-[#FDF2F2] border-l-2 border-[#D93838] text-[#9A2222] text-xs leading-relaxed">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-medium text-[#444444] mb-2 font-mono">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Bùi Diệu"
                                className="w-full bg-[#FAFAFA] border border-[#DCDCDA] px-4 py-3 text-sm text-[#111111] placeholder-[#A0A09E] focus:outline-none focus:border-[#111111] focus:bg-white transition-all duration-150"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider font-medium text-[#444444] mb-2 font-mono">
                                Địa chỉ Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@domain.com"
                                className="w-full bg-[#FAFAFA] border border-[#DCDCDA] px-4 py-3 text-sm text-[#111111] placeholder-[#A0A09E] focus:outline-none focus:border-[#111111] focus:bg-white transition-all duration-150"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs uppercase tracking-wider font-medium text-[#444444] font-mono">
                                    Mật khẩu
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-[11px] text-[#777777] hover:text-[#111111] transition-colors font-mono cursor-pointer"
                                >
                                    {showPassword ? "Ẩn" : "Hiện"}
                                </button>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Tối thiểu 6 ký tự"
                                className="w-full bg-[#FAFAFA] border border-[#DCDCDA] px-4 py-3 text-sm text-[#111111] placeholder-[#A0A09E] focus:outline-none focus:border-[#111111] focus:bg-white transition-all duration-150"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider font-medium text-[#444444] mb-2 font-mono">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0919812339"
                                className="w-full bg-[#FAFAFA] border border-[#DCDCDA] px-4 py-3 text-sm text-[#111111] placeholder-[#A0A09E] focus:outline-none focus:border-[#111111] focus:bg-white transition-all duration-150"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !!successMessage}
                            className="w-full mt-3 py-4 px-6 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-mono font-medium uppercase tracking-[0.2em] transition-all duration-200 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? "Đang khởi tạo tài khoản..." : "Hoàn tất đăng ký"}
                        </button>
                    </form>

                    {/* Footer link */}
                    <div className="mt-8 pt-6 border-t border-[#EAEAE8] flex justify-between items-center text-xs text-[#666666]">
                        <span>Đã có tài khoản?</span>
                        <Link
                            to="/login"
                            className="font-medium text-[#111111] hover:underline underline-offset-4 tracking-wide font-sans"
                        >
                            Đăng nhập ngay →
                        </Link>
                    </div>
                </div>
            </main>

            {/* Bottom Copyright */}
            <footer className="w-full px-8 py-4 border-t border-[#EAEAE8] text-center text-[11px] text-[#999999] font-mono">
                AURA VAULT © {new Date().getFullYear()} • ALL RIGHTS RESERVED
            </footer>
        </div>
    );
}