def greeting():
    print("Hii there")


def calculate_pi(digits=5):
    """
    Calculate pi to the specified number of decimal digits using the Chudnovsky algorithm.
    This algorithm converges very quickly and is suitable for high precision calculations.
    
    Args:
        digits (int): Number of decimal digits to calculate (default: 5)
    
    Returns:
        float: Value of pi to the specified precision
    """
    from decimal import Decimal, getcontext
    
    # Set precision higher than needed for accurate rounding
    getcontext().prec = digits + 10
    
    def compute_pi():
        """
        Uses Chudnovsky algorithm for fast convergence
        """
        C = 426880 * Decimal(10005).sqrt()
        K = Decimal(6)
        M = Decimal(1)
        X = Decimal(1)
        L = Decimal(13591409)
        S = Decimal(13591409)
        
        for i in range(1, digits + 10):
            M = M * (K**3 - 16*K) / ((i)**3)
            K += 12
            L += 545140134
            X *= -262537412640768000
            S += Decimal(M * L) / X
            
            # Check for convergence
            if abs(Decimal(M * L) / X) < Decimal(10) ** (-(digits + 5)):
                break
        
        return C / S
    
    pi_value = compute_pi()
    # Round to the specified number of digits
    return float(round(pi_value, digits))


def calculate_pi_simple(iterations=100000):
    """
    Calculate pi using the Leibniz formula (simpler but slower convergence).
    π/4 = 1 - 1/3 + 1/5 - 1/7 + 1/9 - ...
    
    Args:
        iterations (int): Number of iterations (more = better accuracy)
    
    Returns:
        float: Approximation of pi
    """
    pi = 0
    for i in range(iterations):
        pi += ((-1) ** i) / (2 * i + 1)
    return round(4 * pi, 5)