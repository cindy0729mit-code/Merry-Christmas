# Correcting the initial cost to 148 billion for a more accurate NPV calculation
initial_cost = 148e9  # 148 billion dollars
annual_benefit = 50e6  # 50 million dollars
discount_rate = 0.05  # 5% discount rate
time_period = 50  # 50 years
# Recalculate the NPV
npv_corrected = -initial_cost + sum(annual_benefit / (1 + discount_rate) ** t for t in range(1, time_period + 1))
print(npv_corrected)
